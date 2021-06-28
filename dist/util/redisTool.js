"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiterRedis = exports.redisDb0 = void 0;
const ioredis = require("ioredis");
const Redlock = require("redlock");
const config_1 = __importDefault(require("../config"));
const redisConfig = config_1.default().redis;
const clientCreate = (config, callback) => {
    const redis = new ioredis(config);
    redis.on("connect", () => {
        callback(null, redis);
    });
    redis.on("error", (err) => {
        callback(err, null);
    });
};
const redisConnect = (config) => {
    return new Promise((resolve, reject) => {
        clientCreate(config, (err, conn) => {
            if (err) {
                reject(err);
            }
            resolve(conn);
        });
    });
};
class RedisTool {
    constructor(opt) {
        opt ? (this.config = Object.assign(redisConfig, opt)) : (this.config = redisConfig);
        this.connToRedis()
            .then((res) => {
            if (res) {
                console.log("redis连接成功!");
            }
        })
            .catch((e) => {
            console.error("Redis连接错误:" + e);
        });
    }
    async connToRedis() {
        return new Promise((resolve, reject) => {
            if (this.redis) {
                resolve(true);
            }
            else {
                redisConnect(this.config)
                    .then((resp) => {
                    this.redis = resp;
                    this.redlock = new Redlock([this.redis], {
                        "retryDelay": 200,
                        "retryCount": 1,
                    });
                    resolve(true);
                })
                    .catch((err) => {
                    reject(err);
                });
            }
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
        lock.unlock(function (err) {
            if (err) {
                console.log("解锁失败" + err);
            }
            else {
                console.log("解锁成功");
            }
        });
    }
    async setString(key, value) {
        const val = typeof value !== "string" ? JSON.stringify(value) : value;
        try {
            let res = await this.redis.set(key, val);
            console.error(res);
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
exports.redisDb0 = new RedisTool({ "db": 0 });
exports.limiterRedis = new ioredis(redisConfig);
