"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis_tool = void 0;
const redlock_1 = __importDefault(require("redlock"));
const redis_1 = require("../glues/redis");
const logger_1 = require("./logger");
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
        catch {
            return false;
        }
    }
    async unlockLock(lock) {
        try {
            await lock.unlock();
            logger_1.logger.debug("Redis lock released");
        }
        catch (e) {
            logger_1.logger.error("Redis unlock failed:", e);
        }
    }
    async setString(key, value) {
        const val = typeof value !== "string" ? JSON.stringify(value) : value;
        try {
            return await this.redis.set(key, val);
        }
        catch (e) {
            logger_1.logger.error("Redis setString failed:", e);
            return null;
        }
    }
    async set(key, value) {
        try {
            return await this.redis.set(key, value);
        }
        catch (e) {
            logger_1.logger.error("Redis set failed:", e);
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
            logger_1.logger.error("Redis get failed:", e);
            return null;
        }
    }
    async mget(keys) {
        try {
            return await this.redis.mget(keys);
        }
        catch (e) {
            logger_1.logger.error("Redis mget failed:", e);
            return null;
        }
    }
    async keys(pattern) {
        try {
            return await this.redis.keys(pattern);
        }
        catch (e) {
            logger_1.logger.error("Redis keys failed:", e);
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
                logger_1.logger.warn("Redis del: lock acquisition failed for key:", key);
                return null;
            }
        }
        catch (e) {
            logger_1.logger.error("Redis del failed:", e);
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
                logger_1.logger.warn("Redis sadd: lock acquisition failed for key:", key);
                return null;
            }
        }
        catch (e) {
            logger_1.logger.error("Redis sadd failed:", e);
            return null;
        }
    }
    async smembers(key) {
        try {
            return await this.redis.smembers(key);
        }
        catch (e) {
            logger_1.logger.error("Redis smembers failed:", e);
            return null;
        }
    }
    async sismember(key, member) {
        try {
            return await this.redis.sismember(key, member);
        }
        catch (e) {
            logger_1.logger.error("Redis sismember failed:", e);
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
                logger_1.logger.warn("Redis hset: lock acquisition failed for key:", key);
                return null;
            }
        }
        catch (e) {
            logger_1.logger.error("Redis hset failed:", e);
            return null;
        }
    }
    async hget(key, field) {
        try {
            return await this.redis.hget(key, field);
        }
        catch (e) {
            logger_1.logger.error("Redis hget failed:", e);
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
                logger_1.logger.warn("Redis lpush: lock acquisition failed for key:", key);
                return null;
            }
        }
        catch (e) {
            logger_1.logger.error("Redis lpush failed:", e);
            return null;
        }
    }
    async hgetall(key) {
        try {
            return await this.redis.hgetall(key);
        }
        catch (e) {
            logger_1.logger.error("Redis hgetall failed:", e);
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
                logger_1.logger.warn("Redis hmset: lock acquisition failed for key:", key);
                return null;
            }
        }
        catch (e) {
            logger_1.logger.error("Redis hmset failed:", e);
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
                logger_1.logger.warn("Redis zadd: lock acquisition failed for key:", key);
                return null;
            }
        }
        catch (e) {
            logger_1.logger.error("Redis zadd failed:", e);
            return null;
        }
    }
    async pfadd(key, value) {
        try {
            return await this.redis.pfadd(key, value);
        }
        catch (e) {
            logger_1.logger.error("Redis pfadd failed:", e);
            return null;
        }
    }
    async pfcount(key) {
        try {
            return await this.redis.pfcount(key);
        }
        catch (e) {
            logger_1.logger.error("Redis pfcount failed:", e);
            return null;
        }
    }
    async pfmerge(key, sourcekey) {
        try {
            return await this.redis.pfmerge(key, ...sourcekey);
        }
        catch (e) {
            logger_1.logger.error("Redis pfmerge failed:", e);
            return null;
        }
    }
    async setbit(key, offset, value) {
        try {
            return await this.redis.setbit(key, offset, value);
        }
        catch (e) {
            logger_1.logger.error("Redis setbit failed:", e);
            return null;
        }
    }
    async exists(key) {
        try {
            return await this.redis.exists(key);
        }
        catch (e) {
            logger_1.logger.error("Redis exists failed:", e);
            return null;
        }
    }
    async expire(key, expiration) {
        try {
            return await this.redis.expire(key, expiration);
        }
        catch (e) {
            logger_1.logger.error("Redis expire failed:", e);
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
        logger_1.logger.info(`[RedisTool]:goodDel keys to delete: ${result.length}`);
        for (const key of result) {
            logger_1.logger.debug(`[RedisTool]:goodDel deleting key: ${key}`);
            await new Promise(resolve => setTimeout(resolve, time * 1000));
            await this.unlink(key);
        }
    }
}
exports.redis_tool = new RedisToolImpl(redis_1.redis);
//# sourceMappingURL=redisTool.js.map