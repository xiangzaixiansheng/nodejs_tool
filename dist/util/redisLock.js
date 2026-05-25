"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisLock = exports.RedisLock = void 0;
const crypto = __importStar(require("crypto"));
const redis_1 = require("../glues/redis");
const logger_1 = require("./logger");
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
function generateToken() {
    return crypto.randomBytes(16).toString("hex");
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
class RedisLock {
    client;
    renewTimers = new Map();
    constructor(redisClient) {
        this.client = redisClient || redis_1.redis;
    }
    async acquire(resource, options) {
        const { ttlMs = DEFAULT_TTL_MS, retryCount = DEFAULT_RETRY_COUNT, retryDelayMs = DEFAULT_RETRY_DELAY_MS, autoRenew = false, } = options || {};
        const token = generateToken();
        const lockKey = `lock:${resource}`;
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.set(lockKey, token, "PX", ttlMs, "NX");
            if (result === "OK") {
                if (autoRenew) {
                    this.startRenewal(lockKey, token, ttlMs);
                }
                const handle = {
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
    async release(lockKey, token) {
        this.stopRenewal(lockKey);
        const result = await this.client.eval(UNLOCK_SCRIPT, 1, lockKey, token);
        return result === 1;
    }
    async acquireReentrant(resource, ownerToken, options) {
        const { ttlMs = DEFAULT_TTL_MS, retryCount = DEFAULT_RETRY_COUNT, retryDelayMs = DEFAULT_RETRY_DELAY_MS, } = options || {};
        const lockKey = `lock:reentrant:${resource}`;
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.eval(REENTRANT_LOCK_SCRIPT, 1, lockKey, ownerToken, String(ttlMs));
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
    async releaseReentrant(lockKey, token) {
        const result = await this.client.eval(REENTRANT_UNLOCK_SCRIPT, 1, lockKey, token);
        return result >= 1;
    }
    async acquireReadLock(resource, options) {
        const { ttlMs = DEFAULT_TTL_MS, retryCount = DEFAULT_RETRY_COUNT, retryDelayMs = DEFAULT_RETRY_DELAY_MS, } = options || {};
        const token = generateToken();
        const lockKey = `lock:rw:${resource}`;
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.eval(READ_LOCK_SCRIPT, 1, lockKey, token, String(ttlMs));
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
    async acquireWriteLock(resource, options) {
        const { ttlMs = DEFAULT_TTL_MS, retryCount = DEFAULT_RETRY_COUNT, retryDelayMs = DEFAULT_RETRY_DELAY_MS, } = options || {};
        const token = generateToken();
        const lockKey = `lock:rw:${resource}`;
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const result = await this.client.eval(WRITE_LOCK_SCRIPT, 1, lockKey, token, String(ttlMs));
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
    async acquireSemaphore(resource, limit, options) {
        const { ttlMs = DEFAULT_TTL_MS, retryCount = DEFAULT_RETRY_COUNT, retryDelayMs = DEFAULT_RETRY_DELAY_MS, } = options || {};
        const token = generateToken();
        const semKey = `lock:sem:${resource}`;
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            const now = Date.now();
            const result = await this.client.eval(SEMAPHORE_ACQUIRE_SCRIPT, 1, semKey, String(limit), token, String(ttlMs), String(now));
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
    async withLock(resource, fn, options) {
        const lock = await this.acquire(resource, options);
        if (!lock) {
            throw new Error(`Failed to acquire lock: ${resource}`);
        }
        try {
            return await fn();
        }
        finally {
            const released = await lock.release();
            if (!released) {
                logger_1.logger.warn(`[RedisLock] Lock may have expired before release: ${resource}`);
            }
        }
    }
    async withReadLock(resource, fn, options) {
        const lock = await this.acquireReadLock(resource, options);
        if (!lock) {
            throw new Error(`Failed to acquire read lock: ${resource}`);
        }
        try {
            return await fn();
        }
        finally {
            await lock.release();
        }
    }
    async withWriteLock(resource, fn, options) {
        const lock = await this.acquireWriteLock(resource, options);
        if (!lock) {
            throw new Error(`Failed to acquire write lock: ${resource}`);
        }
        try {
            return await fn();
        }
        finally {
            await lock.release();
        }
    }
    async idempotent(operationId, fn, expireMs = 86400000) {
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
        }
        finally {
            await lock.release();
        }
    }
    async scheduledExec(taskId, fn, options) {
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
        }
        catch (err) {
            logger_1.logger.error(`[RedisLock] Scheduled task failed: ${taskId}`, err);
            return false;
        }
        finally {
            await lock.release();
        }
    }
    async spinLock(resource, timeoutMs = 5000, options) {
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
    startRenewal(lockKey, token, ttlMs) {
        const interval = Math.floor(ttlMs / 3);
        const timer = setInterval(async () => {
            try {
                const result = await this.client.eval(RENEW_SCRIPT, 1, lockKey, token, String(ttlMs));
                if (result !== 1) {
                    this.stopRenewal(lockKey);
                }
            }
            catch (err) {
                logger_1.logger.error(`[RedisLock] Renewal failed for ${lockKey}:`, err);
                this.stopRenewal(lockKey);
            }
        }, interval);
        this.renewTimers.set(lockKey, timer);
    }
    stopRenewal(lockKey) {
        const timer = this.renewTimers.get(lockKey);
        if (timer) {
            clearInterval(timer);
            this.renewTimers.delete(lockKey);
        }
    }
    destroy() {
        for (const [key, timer] of this.renewTimers) {
            clearInterval(timer);
            this.renewTimers.delete(key);
        }
    }
}
exports.RedisLock = RedisLock;
exports.redisLock = new RedisLock();
//# sourceMappingURL=redisLock.js.map