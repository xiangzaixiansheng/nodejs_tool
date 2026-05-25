import { Redis } from "ioredis";
import * as crypto from "crypto";
import { redis } from "../glues/redis";
import { logger } from "./logger";

interface LockOptions {
    ttlMs?: number;
    retryCount?: number;
    retryDelayMs?: number;
    autoRenew?: boolean;
}

interface LockHandle {
    key: string;
    token: string;
    release: () => Promise<boolean>;
}

interface RWLockHandle {
    key: string;
    token: string;
    mode: "read" | "write";
    release: () => Promise<boolean>;
}

interface SemaphoreHandle {
    key: string;
    token: string;
    release: () => Promise<boolean>;
}

const DEFAULT_TTL_MS = 10000;
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 200;

const UNLOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`;

const RENEW_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("pexpire", KEYS[1], ARGV[2])
else
    return 0
end
`;

const REENTRANT_LOCK_SCRIPT = `
local key = KEYS[1]
local token = ARGV[1]
local ttl = tonumber(ARGV[2])
local current = redis.call("get", key)
if current == false then
    redis.call("set", key, token .. ":1", "PX", ttl)
    return 1
end
local parts = {}
for part in string.gmatch(current, "([^:]+)") do
    table.insert(parts, part)
end
if parts[1] == token then
    local count = tonumber(parts[2]) + 1
    redis.call("set", key, token .. ":" .. count, "PX", ttl)
    return count
end
return 0
`;

const REENTRANT_UNLOCK_SCRIPT = `
local key = KEYS[1]
local token = ARGV[1]
local current = redis.call("get", key)
if current == false then
    return 0
end
local parts = {}
for part in string.gmatch(current, "([^:]+)") do
    table.insert(parts, part)
end
if parts[1] ~= token then
    return 0
end
local count = tonumber(parts[2]) - 1
if count <= 0 then
    redis.call("del", key)
    return 1
else
    local ttl = redis.call("pttl", key)
    if ttl > 0 then
        redis.call("set", key, token .. ":" .. count, "PX", ttl)
    end
    return count
end
`;

const READ_LOCK_SCRIPT = `
local writeKey = KEYS[1] .. ":write"
local readKey = KEYS[1] .. ":readers"
if redis.call("exists", writeKey) == 1 then
    return 0
end
redis.call("hset", readKey, ARGV[1], 1)
redis.call("pexpire", readKey, ARGV[2])
return 1
`;

const READ_UNLOCK_SCRIPT = `
local readKey = KEYS[1] .. ":readers"
redis.call("hdel", readKey, ARGV[1])
if redis.call("hlen", readKey) == 0 then
    redis.call("del", readKey)
end
return 1
`;

const WRITE_LOCK_SCRIPT = `
local writeKey = KEYS[1] .. ":write"
local readKey = KEYS[1] .. ":readers"
if redis.call("exists", writeKey) == 1 then
    return 0
end
if redis.call("hlen", readKey) > 0 then
    return 0
end
redis.call("set", writeKey, ARGV[1], "PX", ARGV[2])
return 1
`;

const WRITE_UNLOCK_SCRIPT = `
local writeKey = KEYS[1] .. ":write"
if redis.call("get", writeKey) == ARGV[1] then
    return redis.call("del", writeKey)
end
return 0
`;

const SEMAPHORE_ACQUIRE_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local token = ARGV[2]
local ttl = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
redis.call("zremrangebyscore", key, "-inf", now - ttl)
if redis.call("zcard", key) < limit then
    redis.call("zadd", key, now, token)
    redis.call("pexpire", key, ttl)
    return 1
end
return 0
`;

const SEMAPHORE_RELEASE_SCRIPT = `
return redis.call("zrem", KEYS[1], ARGV[1])
`;

function generateToken(): string {
    return crypto.randomBytes(16).toString("hex");
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RedisLock {
    private readonly client: Redis;
    private readonly renewTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(redisClient?: Redis) {
        this.client = redisClient || redis;
    }

    /**
     * 互斥锁 — 最常用的分布式锁
     *
     * 场景：防止重复下单、防止定时任务多实例重复执行、资源独占访问
     */
    async acquire(resource: string, options?: LockOptions): Promise<LockHandle | null> {
        const {
            ttlMs = DEFAULT_TTL_MS,
            retryCount = DEFAULT_RETRY_COUNT,
            retryDelayMs = DEFAULT_RETRY_DELAY_MS,
            autoRenew = false,
        } = options || {};

        const token = generateToken();
        const lockKey = `lock:${resource}`;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.set(lockKey, token, "PX", ttlMs, "NX");

            if (result === "OK") {
                if (autoRenew) {
                    this.startRenewal(lockKey, token, ttlMs);
                }

                const handle: LockHandle = {
                    key: lockKey,
                    token,
                    release: () => this.release(lockKey, token),
                };
                return handle;
            }

            if (attempt < retryCount) {
                const jitter = Math.random() * retryDelayMs * 0.5;
                await sleep(retryDelayMs + jitter);
            }
        }

        return null;
    }

    /**
     * 释放互斥锁
     */
    private async release(lockKey: string, token: string): Promise<boolean> {
        this.stopRenewal(lockKey);
        const result = await this.client.eval(UNLOCK_SCRIPT, 1, lockKey, token);
        return result === 1;
    }

    /**
     * 可重入锁 — 同一持有者可多次加锁
     *
     * 场景：递归调用中需要锁保护、嵌套业务方法共享同一把锁
     */
    async acquireReentrant(
        resource: string,
        ownerToken: string,
        options?: Omit<LockOptions, "autoRenew">
    ): Promise<LockHandle | null> {
        const {
            ttlMs = DEFAULT_TTL_MS,
            retryCount = DEFAULT_RETRY_COUNT,
            retryDelayMs = DEFAULT_RETRY_DELAY_MS,
        } = options || {};

        const lockKey = `lock:reentrant:${resource}`;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.eval(
                REENTRANT_LOCK_SCRIPT, 1, lockKey, ownerToken, String(ttlMs)
            ) as number;

            if (result > 0) {
                return {
                    key: lockKey,
                    token: ownerToken,
                    release: () => this.releaseReentrant(lockKey, ownerToken),
                };
            }

            if (attempt < retryCount) {
                await sleep(retryDelayMs);
            }
        }

        return null;
    }

    private async releaseReentrant(lockKey: string, token: string): Promise<boolean> {
        const result = await this.client.eval(REENTRANT_UNLOCK_SCRIPT, 1, lockKey, token);
        return (result as number) >= 1;
    }

    /**
     * 读写锁 — 读共享、写独占
     *
     * 场景：缓存更新（写时阻塞读）、配置热加载、多读少写的共享资源
     */
    async acquireReadLock(
        resource: string,
        options?: Omit<LockOptions, "autoRenew">
    ): Promise<RWLockHandle | null> {
        const {
            ttlMs = DEFAULT_TTL_MS,
            retryCount = DEFAULT_RETRY_COUNT,
            retryDelayMs = DEFAULT_RETRY_DELAY_MS,
        } = options || {};

        const token = generateToken();
        const lockKey = `lock:rw:${resource}`;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.eval(
                READ_LOCK_SCRIPT, 1, lockKey, token, String(ttlMs)
            ) as number;

            if (result === 1) {
                return {
                    key: lockKey,
                    token,
                    mode: "read",
                    release: async () => {
                        const r = await this.client.eval(READ_UNLOCK_SCRIPT, 1, lockKey, token);
                        return r === 1;
                    },
                };
            }

            if (attempt < retryCount) {
                await sleep(retryDelayMs);
            }
        }

        return null;
    }

    async acquireWriteLock(
        resource: string,
        options?: Omit<LockOptions, "autoRenew">
    ): Promise<RWLockHandle | null> {
        const {
            ttlMs = DEFAULT_TTL_MS,
            retryCount = DEFAULT_RETRY_COUNT,
            retryDelayMs = DEFAULT_RETRY_DELAY_MS,
        } = options || {};

        const token = generateToken();
        const lockKey = `lock:rw:${resource}`;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.eval(
                WRITE_LOCK_SCRIPT, 1, lockKey, token, String(ttlMs)
            ) as number;

            if (result === 1) {
                return {
                    key: lockKey,
                    token,
                    mode: "write",
                    release: async () => {
                        const r = await this.client.eval(WRITE_UNLOCK_SCRIPT, 1, lockKey, token);
                        return r === 1;
                    },
                };
            }

            if (attempt < retryCount) {
                await sleep(retryDelayMs);
            }
        }

        return null;
    }

    /**
     * 信号量 — 限制并发访问数量
     *
     * 场景：限制同时访问第三方 API 的并发数、数据库连接池控制、限流
     */
    async acquireSemaphore(
        resource: string,
        limit: number,
        options?: Omit<LockOptions, "autoRenew">
    ): Promise<SemaphoreHandle | null> {
        const {
            ttlMs = DEFAULT_TTL_MS,
            retryCount = DEFAULT_RETRY_COUNT,
            retryDelayMs = DEFAULT_RETRY_DELAY_MS,
        } = options || {};

        const token = generateToken();
        const semKey = `lock:sem:${resource}`;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const now = Date.now();
            const result = await this.client.eval(
                SEMAPHORE_ACQUIRE_SCRIPT, 1, semKey,
                String(limit), token, String(ttlMs), String(now)
            ) as number;

            if (result === 1) {
                return {
                    key: semKey,
                    token,
                    release: async () => {
                        const r = await this.client.eval(SEMAPHORE_RELEASE_SCRIPT, 1, semKey, token);
                        return r === 1;
                    },
                };
            }

            if (attempt < retryCount) {
                await sleep(retryDelayMs);
            }
        }

        return null;
    }

    /**
     * 带锁执行 — 自动获取和释放锁
     *
     * 场景：最常用的模式，保证 fn 执行期间持有锁，执行完自动释放
     */
    async withLock<T>(
        resource: string,
        fn: () => Promise<T>,
        options?: LockOptions
    ): Promise<T> {
        const lock = await this.acquire(resource, options);
        if (!lock) {
            throw new Error(`Failed to acquire lock: ${resource}`);
        }

        try {
            return await fn();
        } finally {
            const released = await lock.release();
            if (!released) {
                logger.warn(`[RedisLock] Lock may have expired before release: ${resource}`);
            }
        }
    }

    /**
     * 带读锁执行
     */
    async withReadLock<T>(
        resource: string,
        fn: () => Promise<T>,
        options?: Omit<LockOptions, "autoRenew">
    ): Promise<T> {
        const lock = await this.acquireReadLock(resource, options);
        if (!lock) {
            throw new Error(`Failed to acquire read lock: ${resource}`);
        }

        try {
            return await fn();
        } finally {
            await lock.release();
        }
    }

    /**
     * 带写锁执行
     */
    async withWriteLock<T>(
        resource: string,
        fn: () => Promise<T>,
        options?: Omit<LockOptions, "autoRenew">
    ): Promise<T> {
        const lock = await this.acquireWriteLock(resource, options);
        if (!lock) {
            throw new Error(`Failed to acquire write lock: ${resource}`);
        }

        try {
            return await fn();
        } finally {
            await lock.release();
        }
    }

    /**
     * 幂等性保护 — 防止重复操作
     *
     * 场景：防止重复支付、防止重复发送通知、接口幂等性保障
     */
    async idempotent<T>(
        operationId: string,
        fn: () => Promise<T>,
        expireMs: number = 86400000
    ): Promise<{ executed: boolean; result?: T }> {
        const idempotentKey = `idempotent:${operationId}`;

        const exists = await this.client.exists(idempotentKey);
        if (exists) {
            return { executed: false };
        }

        const lock = await this.acquire(`idempotent-lock:${operationId}`, {
            ttlMs: 30000,
            retryCount: 5,
            retryDelayMs: 500,
        });

        if (!lock) {
            return { executed: false };
        }

        try {
            const doubleCheck = await this.client.exists(idempotentKey);
            if (doubleCheck) {
                return { executed: false };
            }

            const result = await fn();
            await this.client.set(idempotentKey, "1", "PX", expireMs);
            return { executed: true, result };
        } finally {
            await lock.release();
        }
    }

    /**
     * 延迟队列锁 — 确保任务在指定时间后只被一个消费者执行
     *
     * 场景：订单超时取消、延迟通知、定时任务抢占
     */
    async scheduledExec(
        taskId: string,
        fn: () => Promise<void>,
        options?: LockOptions
    ): Promise<boolean> {
        const lock = await this.acquire(`scheduled:${taskId}`, {
            ttlMs: 30000,
            retryCount: 0,
            ...options,
        });

        if (!lock) {
            return false;
        }

        try {
            await fn();
            return true;
        } catch (err) {
            logger.error(`[RedisLock] Scheduled task failed: ${taskId}`, err);
            return false;
        } finally {
            await lock.release();
        }
    }

    /**
     * 自旋锁 — 持续等待直到获取锁或超时
     *
     * 场景：短时间高竞争资源、库存扣减、热点数据更新
     */
    async spinLock(
        resource: string,
        timeoutMs: number = 5000,
        options?: Omit<LockOptions, "retryCount" | "retryDelayMs">
    ): Promise<LockHandle | null> {
        const { ttlMs = DEFAULT_TTL_MS, autoRenew = false } = options || {};
        const token = generateToken();
        const lockKey = `lock:${resource}`;
        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {
            const result = await this.client.set(lockKey, token, "PX", ttlMs, "NX");

            if (result === "OK") {
                if (autoRenew) {
                    this.startRenewal(lockKey, token, ttlMs);
                }
                return {
                    key: lockKey,
                    token,
                    release: () => this.release(lockKey, token),
                };
            }

            await sleep(50 + Math.random() * 50);
        }

        return null;
    }

    /**
     * 启动自动续期（看门狗机制）
     */
    private startRenewal(lockKey: string, token: string, ttlMs: number): void {
        const interval = Math.floor(ttlMs / 3);
        const timer = setInterval(async () => {
            try {
                const result = await this.client.eval(RENEW_SCRIPT, 1, lockKey, token, String(ttlMs));
                if (result !== 1) {
                    this.stopRenewal(lockKey);
                }
            } catch (err) {
                logger.error(`[RedisLock] Renewal failed for ${lockKey}:`, err);
                this.stopRenewal(lockKey);
            }
        }, interval);

        this.renewTimers.set(lockKey, timer);
    }

    private stopRenewal(lockKey: string): void {
        const timer = this.renewTimers.get(lockKey);
        if (timer) {
            clearInterval(timer);
            this.renewTimers.delete(lockKey);
        }
    }

    /**
     * 清理所有续期定时器（优雅关闭时调用）
     */
    destroy(): void {
        for (const [key, timer] of this.renewTimers) {
            clearInterval(timer);
            this.renewTimers.delete(key);
        }
    }
}

export const redisLock = new RedisLock();
