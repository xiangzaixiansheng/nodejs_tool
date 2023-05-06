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
    lock2(key, timeout = 1000) {
        return this.redis.set(key, Date.now(), "EX", timeout, "NX").then(Boolean);
    }
    lock3(key, timeout = 1000) {
        return this.redis.eval(`
        if redis.call("exists", KEYS[1]) == 1 then
          return 0
        end
        redis.call("set", KEYS[1], ARGV[1], "PX", ARGV[2])
        return 1
      `, 1, key, Date.now(), timeout).then(response => response === 0);
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
        const data = await this.redis.get(key);
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return data;
        }
    }
    async get(key) {
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
    expire(key, expiration) {
        try {
            return this.redis.expire(key, expiration);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async scan(pattern, amountPerScan) {
        let _self = this.redis;
        const startCursor = '0';
        let keys = [];
        return new Promise((resolve, reject) => {
            function scanNext(cursor = startCursor) {
                _self.scan(cursor, 'MATCH', pattern, 'COUNT', amountPerScan, function (err, reply) {
                    if (err) {
                        throw new Error("redis error");
                    }
                    const [cursor, keysScan] = reply;
                    if (keysScan.length) {
                        keys.push(...keysScan);
                    }
                    if (cursor === '0') {
                        return resolve(Array.from(new Set(keys)));
                    }
                    else {
                        return scanNext(cursor);
                    }
                });
            }
            scanNext();
        });
    }
    unlink(key) {
        return this.redis.unlink(key);
    }
    async goodDEl(pattern, time) {
        let result = await this.scan(pattern, 100);
        console.info(`[RedisTool]:goodDEl 一共需要删除key的数量`, result.length);
        for (let key of result) {
            console.info(`[RedisTool]:goodDEl 已经删除的key`, key);
            await new Promise(resolve => setTimeout(resolve, time * 1000));
            await this.unlink(key);
        }
    }
}
exports.redis_tool = new RedisTool(redis_1.redis);
