
import { redis } from "../glues/redis";

class RedisManager {
  public rpush(key: string, data: string) {
    return redis.rpush(key, data);
  }

  public lpop(key: string) {
    return redis.lpop(key);
  }

  // acquireTimeoutSeconds 加锁等待时间 ttlSeconds加锁过期时间
  public async lock(
    key: string,
    value: string,
    acquireTimeoutSeconds: number = 3,
    ttlSeconds: number = 10
  ): Promise<boolean> {
    const acquireTimeout = acquireTimeoutSeconds * 1000;
    let lockTimeout = ttlSeconds * 1000;
    const lockKey = this.getRedisLockKey(key);
    lockTimeout = Math.ceil(lockTimeout); // 超时时间都是整数
    const end = Date.now() + acquireTimeout;
    while (Date.now() < end) {
      const ret = await redis.set(lockKey, value, "PX", lockTimeout, "NX");
      if (ret === "OK") return true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
  }

  public async unLock(key: string, value: string) {
    const lockKey = this.getRedisLockKey(key);
    return redis.eval(
      `
    if (redis.call("get", KEYS[1]) == ARGV[1])
    then
      return redis.call("del", KEYS[1]);
    end
    `,
      1,
      lockKey,
      value
    );
  }

  public getRedisLockKey(key: string) {
    return `${key}:LOCK`;
  }
}

export const redisManager = new RedisManager();
