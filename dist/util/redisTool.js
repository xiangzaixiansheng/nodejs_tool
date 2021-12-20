"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis_tool = void 0;
const Redlock = require("redlock");
const redis_1 = require("../glues/redis");
class RedisTool {
    constructor(_redis) {
        this.redis = _redis;
        this.redlock = new Redlock([this.redis], {
            "retryDelay": 200,
            "retryCount": 1,
        });
    }
    async lock(ressource) {
        try {
            const lockKey = ressource + "_LOCK_";
            return await this.redlock.lock(lockKey, 1000);
        }
        catch (err) {
            return false;
        }
    }
    async unlockLock(lock) {
        return await lock.unlock().then((res) => {
            console.log("解锁成功");
        }).catch((e) => {
            console.log("解锁失败" + e);
        });
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
            let res = await this.redis.set(key, value);
            return res;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async getString(key) {
        try {
            return await this.redis.get(key);
        }
        catch (e) {
            console.error(e.stack);
            return null;
        }
    }
    async mget(keys) {
        try {
            return await this.redis.mget(keys);
        }
        catch (e) {
            console.error(e.stack);
            return null;
        }
    }
    async keys(keys) {
        try {
            return await this.redis.keys(keys);
        }
        catch (e) {
            console.error(e.stack);
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
                const res = await this.redis.sadd(key, value);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async smembers(key) {
        try {
            const res = await this.redis.smembers(key);
            return res;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async sismember(key, member) {
        try {
            const res = await this.redis.sismember(key, member);
            return res;
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
                const res = await this.redis.lpush(key, values);
                this.unlockLock(lock);
                return res;
            }
            else {
                console.log("其他线程在处理中");
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
            const res = await this.redis.pfadd(key, value);
            return res;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async pfcount(key) {
        try {
            const res = await this.redis.pfcount(key);
            return res;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async pfmerge(key, sourcekey) {
        try {
            const res = await this.redis.pfmerge(key, sourcekey);
            return res;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async setbit(key, offset, value) {
        try {
            const res = await this.redis.setbit(key, offset, value);
            return res;
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
        let _self = this.redis;
        let cursor = '0';
        let keys = [];
        return new Promise((resolve, reject) => {
            function scanNext() {
                _self.scan(cursor, 'MATCH', pattern, 'COUNT', amountPerScan, function (err, reply) {
                    if (err) {
                        throw new Error("redis error");
                    }
                    cursor = reply[0];
                    const keysScan = reply[1];
                    if (keysScan.length) {
                        keys = keys.concat(keysScan);
                    }
                    if (cursor === '0') {
                        let result = Array.from(new Set(keys));
                        return resolve(result);
                    }
                    else {
                        return scanNext();
                    }
                });
            }
            scanNext();
        });
    }
}
exports.redis_tool = new RedisTool(redis_1.redis);
