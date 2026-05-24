"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis_tool = void 0;
const redlock_1 = __importDefault(require("redlock"));
const redis_1 = require("../glues/redis");
class RedisToolImpl {
    redis;
    redlock;
    constructor(_redis) {
        this.redis = _redis;
        this.redlock = new redlock_1.default([this.redis], {
            retryDelay: 200,
            retryCount: 1,
        });
    }
    async lock(resource) {
        try {
            const lockKey = resource + "_LOCK_";
            return await this.redlock.lock(lockKey, 1000);
        }
        catch (err) {
            return false;
        }
    }
    async unlockLock(lock) {
        try {
            await lock.unlock();
            console.log("解锁成功");
        }
        catch (e) {
            console.log("解锁失败" + e);
        }
    }
    async setString(key, value) {
        const val = typeof value !== "string" ? JSON.stringify(value) : value;
        try {
            return await this.redis.set(key, val);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async set(key, value) {
        try {
            return await this.redis.set(key, value);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async getString(key) {
        const data = await this.redis.get(key);
        try {
            return data ? JSON.parse(data) : null;
        }
        catch {
            return data;
        }
    }
    async get(key) {
        try {
            return await this.redis.get(key);
        }
        catch (e) {
            console.error(e?.stack);
            return null;
        }
    }
    async mget(keys) {
        try {
            return await this.redis.mget(keys);
        }
        catch (e) {
            console.error(e?.stack);
            return null;
        }
    }
    async keys(pattern) {
        try {
            return await this.redis.keys(pattern);
        }
        catch (e) {
            console.error(e?.stack);
            return null;
        }
    }
    async del(key) {
        try {
            const lock = await this.lock(key);
            if (lock) {
                const res = await this.redis.del(key);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
                return null;
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async sadd(key, value) {
        try {
            const lock = await this.lock(key);
            if (lock) {
                const res = Array.isArray(value)
                    ? await this.redis.sadd(key, ...value)
                    : await this.redis.sadd(key, value);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
                return null;
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async smembers(key) {
        try {
            return await this.redis.smembers(key);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async sismember(key, member) {
        try {
            return await this.redis.sismember(key, member);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async hset(key, field, value) {
        try {
            const lock = await this.lock(key);
            if (lock) {
                const res = await this.redis.hset(key, field, value);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
                return null;
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async hget(key, field) {
        try {
            return await this.redis.hget(key, field);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async lpush(key, values) {
        try {
            const lock = await this.lock(key);
            if (lock) {
                const res = await this.redis.lpush(key, ...values);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
                return null;
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async hgetall(key) {
        try {
            return await this.redis.hgetall(key);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async hmset(key, value) {
        try {
            const lock = await this.lock(key);
            if (lock) {
                const res = await this.redis.hmset(key, value);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
                return null;
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async zadd(key, score, value) {
        try {
            const lock = await this.lock(key);
            if (lock) {
                const res = await this.redis.zadd(key, score, value);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
                return null;
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async pfadd(key, value) {
        try {
            return await this.redis.pfadd(key, value);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async pfcount(key) {
        try {
            return await this.redis.pfcount(key);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async pfmerge(key, sourcekey) {
        try {
            return await this.redis.pfmerge(key, ...sourcekey);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async setbit(key, offset, value) {
        try {
            return await this.redis.setbit(key, offset, value);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async exists(key) {
        try {
            return await this.redis.exists(key);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async expire(key, expiration) {
        try {
            return await this.redis.expire(key, expiration);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async scan(pattern, amountPerScan) {
        const keys = [];
        let cursor = '0';
        do {
            const [newCursor, scanKeys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', amountPerScan);
            keys.push(...scanKeys);
            cursor = newCursor;
        } while (cursor !== '0');
        return Array.from(new Set(keys));
    }
    async scan2(key) {
        const result = [];
        let cursor = '0';
        do {
            const [newCursor, elements] = await this.redis.scan(cursor, "MATCH", key, "COUNT", 300);
            result.push(...elements);
            cursor = newCursor;
        } while (cursor !== '0');
        return Array.from(new Set(result));
    }
    async unlink(key) {
        return this.redis.unlink(key);
    }
    async goodDel(pattern, time) {
        const result = await this.scan(pattern, 100);
        console.info(`[RedisTool]:goodDel 一共需要删除key的数量`, result.length);
        for (const key of result) {
            console.info(`[RedisTool]:goodDel 已经删除的key`, key);
            await new Promise(resolve => setTimeout(resolve, time * 1000));
            await this.unlink(key);
        }
    }
}
exports.redis_tool = new RedisToolImpl(redis_1.redis);
//# sourceMappingURL=redisTool.js.map