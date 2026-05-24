"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisManager = void 0;
const redis_1 = require("../glues/redis");
class RedisManager {
    rpush(key, data) {
        return redis_1.redis.rpush(key, data);
    }
    lpop(key) {
        return redis_1.redis.lpop(key);
    }
    async lock(key, value, acquireTimeoutSeconds = 3, ttlSeconds = 10) {
        const acquireTimeout = acquireTimeoutSeconds * 1000;
        let lockTimeout = ttlSeconds * 1000;
        const lockKey = this.getRedisLockKey(key);
        lockTimeout = Math.ceil(lockTimeout);
        const end = Date.now() + acquireTimeout;
        while (Date.now() < end) {
            const ret = await redis_1.redis.set(lockKey, value, "PX", lockTimeout, "NX");
            if (ret === "OK")
                return true;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return false;
    }
    async unLock(key, value) {
        const lockKey = this.getRedisLockKey(key);
        return redis_1.redis.eval(`
    if (redis.call("get", KEYS[1]) == ARGV[1])
    then
      return redis.call("del", KEYS[1]);
    end
    `, 1, lockKey, value);
    }
    getRedisLockKey(key) {
        return `${key}:LOCK`;
    }
}
exports.redisManager = new RedisManager();
//# sourceMappingURL=redisTool2.js.map