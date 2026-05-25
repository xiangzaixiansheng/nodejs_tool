import { Redis } from 'ioredis';
import Redlock from 'redlock';
import { redis } from "../glues/redis";
import { logger } from './logger';

type Lock = {
  unlock: () => Promise<void>;
};

export interface RedisTool {
  setString(key: string, value: unknown): Promise<string | null>;
  getString(key: string): Promise<unknown>;
  del(key: string): Promise<number | null>;
}

class RedisToolImpl implements RedisTool {
  public redis!: Redis;
  public redlock!: Redlock;

  constructor(_redis: Redis) {
    this.redis = _redis;
    this.redlock = new Redlock([this.redis], {
      retryDelay: 200,
      retryCount: 1,
    });
  }

  public async lock(resource: string): Promise<Lock | false> {
    try {
      const lockKey = resource + "_LOCK_";
      return await this.redlock.lock(lockKey, 1000);
    } catch {
      return false;
    }
  }

  public async unlockLock(lock: Lock) {
    try {
      await lock.unlock();
      logger.debug("Redis lock released");
    } catch (e) {
      logger.error("Redis unlock failed:", e);
    }
  }

  public async setString(key: string, value: unknown) {
    const val = typeof value !== "string" ? JSON.stringify(value) : value;
    try {
      return await this.redis.set(key, val);
    } catch (e) {
      logger.error("Redis setString failed:", e);
      return null;
    }
  }

  public async set(key: string, value: string | number) {
    try {
      return await this.redis.set(key, value);
    } catch (e) {
      logger.error("Redis set failed:", e);
      return null;
    }
  }

  public async getString(key: string) {
    const data = await this.redis.get(key);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return data;
    }
  }

  public async get(key: string) {
    try {
      return await this.redis.get(key);
    } catch (e) {
      logger.error("Redis get failed:", e);
      return null;
    }
  }

  public async mget(keys: string[]) {
    try {
      return await this.redis.mget(keys);
    } catch (e) {
      logger.error("Redis mget failed:", e);
      return null;
    }
  }

  public async keys(pattern: string) {
    try {
      return await this.redis.keys(pattern);
    } catch (e) {
      logger.error("Redis keys failed:", e);
      return null;
    }
  }

  public async del(key: string) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.del(key);
        this.unlockLock(lock);
        return res;
      } else {
        logger.warn("Redis del: lock acquisition failed for key:", key);
        return null;
      }
    } catch (e) {
      logger.error("Redis del failed:", e);
      return null;
    }
  }

  public async sadd(key: string, value: string | string[]) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = Array.isArray(value)
          ? await this.redis.sadd(key, ...value)
          : await this.redis.sadd(key, value);
        this.unlockLock(lock);
        return res;
      } else {
        logger.warn("Redis sadd: lock acquisition failed for key:", key);
        return null;
      }
    } catch (e) {
      logger.error("Redis sadd failed:", e);
      return null;
    }
  }

  public async smembers(key: string) {
    try {
      return await this.redis.smembers(key);
    } catch (e) {
      logger.error("Redis smembers failed:", e);
      return null;
    }
  }

  public async sismember(key: string, member: string) {
    try {
      return await this.redis.sismember(key, member);
    } catch (e) {
      logger.error("Redis sismember failed:", e);
      return null;
    }
  }

  public async hset(key: string, field: string, value: string | number) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.hset(key, field, value);
        this.unlockLock(lock);
        return res;
      } else {
        logger.warn("Redis hset: lock acquisition failed for key:", key);
        return null;
      }
    } catch (e) {
      logger.error("Redis hset failed:", e);
      return null;
    }
  }

  public async hget(key: string, field: string) {
    try {
      return await this.redis.hget(key, field);
    } catch (e) {
      logger.error("Redis hget failed:", e);
      return null;
    }
  }

  public async lpush(key: string, values: string[]) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.lpush(key, ...values);
        this.unlockLock(lock);
        return res;
      } else {
        logger.warn("Redis lpush: lock acquisition failed for key:", key);
        return null;
      }
    } catch (e) {
      logger.error("Redis lpush failed:", e);
      return null;
    }
  }

  public async hgetall(key: string) {
    try {
      return await this.redis.hgetall(key);
    } catch (e) {
      logger.error("Redis hgetall failed:", e);
      return null;
    }
  }

  public async hmset(key: string, value: Record<string, string>) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.hmset(key, value);
        this.unlockLock(lock);
        return res;
      } else {
        logger.warn("Redis hmset: lock acquisition failed for key:", key);
        return null;
      }
    } catch (e) {
      logger.error("Redis hmset failed:", e);
      return null;
    }
  }

  public async zadd(key: string, score: number, value: string) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.zadd(key, score, value);
        this.unlockLock(lock);
        return res;
      } else {
        logger.warn("Redis zadd: lock acquisition failed for key:", key);
        return null;
      }
    } catch (e) {
      logger.error("Redis zadd failed:", e);
      return null;
    }
  }

  public async pfadd(key: string, value: string) {
    try {
      return await this.redis.pfadd(key, value);
    } catch (e) {
      logger.error("Redis pfadd failed:", e);
      return null;
    }
  }

  public async pfcount(key: string) {
    try {
      return await this.redis.pfcount(key);
    } catch (e) {
      logger.error("Redis pfcount failed:", e);
      return null;
    }
  }

  public async pfmerge(key: string, sourcekey: string[]) {
    try {
      return await this.redis.pfmerge(key, ...sourcekey);
    } catch (e) {
      logger.error("Redis pfmerge failed:", e);
      return null;
    }
  }

  public async setbit(key: string, offset: number, value: string) {
    try {
      return await this.redis.setbit(key, offset, value);
    } catch (e) {
      logger.error("Redis setbit failed:", e);
      return null;
    }
  }

  public async exists(key: string) {
    try {
      return await this.redis.exists(key);
    } catch (e) {
      logger.error("Redis exists failed:", e);
      return null;
    }
  }

  public async expire(key: string, expiration: number) {
    try {
      return await this.redis.expire(key, expiration);
    } catch (e) {
      logger.error("Redis expire failed:", e);
      return null;
    }
  }

  public async scan(pattern: string, amountPerScan: number): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [newCursor, scanKeys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        amountPerScan
      );
      keys.push(...scanKeys);
      cursor = newCursor;
    } while (cursor !== '0');

    return Array.from(new Set(keys));
  }

  public async scan2(key: string): Promise<string[]> {
    const result: string[] = [];
    let cursor = '0';

    do {
      const [newCursor, elements] = await this.redis.scan(
        cursor,
        "MATCH",
        key,
        "COUNT",
        300
      );
      result.push(...elements);
      cursor = newCursor;
    } while (cursor !== '0');

    return Array.from(new Set(result));
  }

  public async unlink(key: string) {
    return this.redis.unlink(key);
  }

  public async goodDel(pattern: string, time: number) {
    const result = await this.scan(pattern, 100);
    logger.info(`[RedisTool]:goodDel keys to delete: ${result.length}`);
    for (const key of result) {
      logger.debug(`[RedisTool]:goodDel deleting key: ${key}`);
      await new Promise(resolve => setTimeout(resolve, time * 1000));
      await this.unlink(key);
    }
  }
}

export const redis_tool = new RedisToolImpl(redis);
