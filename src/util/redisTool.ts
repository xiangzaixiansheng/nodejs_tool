/**
 * @description redis操作封装方法
 * @author xiangzai
 */

import ioredis = require('ioredis');
//import * as ioredis from "ioredis";

import Redlock = require("redlock");

import { redis } from "../glues/redis";

/**
 * author: xiangzai
 * @desc：redis链接
 * 
 */
// tslint:disable-next-line:class-name
export interface redisTool {
  /**
   * 存储string类型的key-value
   * @param key key
   * @param value value
   */
  setString(key: string, value: any): Promise<string | null>;
  /**
   * 获取string类型的key-value
   * @param key string
   * @return value
   */
  getString(key: any): Promise<string | null>;
  /**
   * 删除string类型的key-value
   * @param key key
   */
  del(key: string): Promise<number | null>;
}

/**
 * author: xiangzai
 * @desc：redis封装方法
 */
class RedisTool implements redisTool {
  /**
   * redis
   */
  public redis!: ioredis.Redis;
  /**
   * redis  分布式锁
   * https://github.com/mike-marcacci/node-redlock
   */
  public redlock!: Redlock;


  constructor(_redis: ioredis.Redis) {
    this.redis = _redis;
    this.redlock = new Redlock([this.redis], {
      "retryDelay": 200, // 两次尝试之间的时间间隔ms
      "retryCount": 1, // 最大次数Redlock将尝试
    });
  }

  /**
   * 基于redis分布式锁实现
   * @param ressource 要锁定的资源的字符串标识符
   */
  public async lock(ressource: string) {
    try {
      const lockKey: string = ressource + "_LOCK_";
      return await this.redlock.lock(lockKey, 1000,);
      // lock.unlock();
    } catch (err) {
      return false;
    }
  }

  /**
   * 简单的lock
   * @param key 
   * @param timeout 
   * @returns 
   */
  public lock2(key: string, timeout: number = 1000): Promise<boolean> {
    return this.redis.set(key, Date.now(), "EX", timeout, "NX").then(Boolean);
  }

  public lock3(key: string, timeout: number = 1000): Promise<boolean> {
    return this.redis.eval(`
        if redis.call("exists", KEYS[1]) == 1 then
          return 0
        end
        redis.call("set", KEYS[1], ARGV[1], "PX", ARGV[2])
        return 1
      `, 1, key, Date.now(), timeout).then(response => response === 0);

  }

  /**
   * 解锁方法
   * @param lock 锁对象
   */
  public async unlockLock(lock: any) {
    return await lock.unlock().then((res: any) => {
      console.log("解锁成功");
    }).catch((e: any) => {
      console.log("解锁失败" + e);
    });
  }

  /**
   * 存储string类型/JSON类型的value
   * @param key key
   * @param value value
   * @returns "OK" or null
   */
  public async setString(key: string, value: any) {
    const val: string = typeof value !== "string" ? JSON.stringify(value) : value;
    try {
      return await this.redis.set(key, val);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   *
   * @param key key
   * @param value value
   * @returns "OK" or null
   */
  public async set(key: string, value: any) {
    try {
      let res = await this.redis.set(key, value);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  public async getString(key: string) {
    const data: any = await this.redis.get(key);
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  public async get(key: string) {
    try {
      return await this.redis.get(key);
    } catch (e) {
      //@ts-ignore
      console.error(e.stack);
      return null;
    }
  }

  /**
   * 批量获取
   * @param keys keys
   */
  public async mget(keys: Array<string>) {
    try {
      return await this.redis.mget(keys);
    } catch (e) {
      // tslint:disable-next-line:no-console
      //@ts-ignore
      console.error(e.stack);
      return null;
    }
  }

  /**
   * 批量获取key
   * @param keys 支持部分正则表达式
   */
  public async keys(keys: string) {
    try {
      return await this.redis.keys(keys);
    } catch (e) {
      // tslint:disable-next-line:no-console
      //@ts-ignore
      console.error(e.stack);
      return null;
    }
  }

  /**
   * 删除string类型的key-value
   * @param key key
   */
  public async del(key: string) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.del(key);
        // 处理完成后解锁
        this.unlockLock(lock);
        return res;
      } else {
        // 其他线程在处理中
        console.log("其他线程在处理中");
        return null;
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   *  sadd 将给定元素添加到集合 插入元素数量 sadd('key', 'value1'[, 'value2', ...]) (不支持数组赋值)(元素不允许重复)
   * @param key key
   * @param value value
   */
  public async sadd(key: string, value: any) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.sadd(key, value);
        // 处理完成后解锁
        this.unlockLock(lock);
        return res;
      } else {
        // 其他线程在处理中
        console.log("其他线程在处理中");
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);

      return null;
    }
  }

  /**
   *  获取集合内所有成员
   * @param key key
   */
  public async smembers(key: string) {
    try {
      const res = await this.redis.smembers(key);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   *  判断是否存在这个成员
   * @param key key
   * @param member string
   */
  public async sismember(key: string, member: string) {
    try {
      const res = await this.redis.sismember(key, member);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);

      return null;
    }
  }

  /**
   * 散列hash：存储类似JSON形式
   * @param key key
   * @param field fieldKey
   * @param value value
   */
  public async hset(key: string, field: string, value: any) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.hset(key, field, value);
        // 处理完成后解锁
        this.unlockLock(lock);
        return res;
      } else {
        // 其他线程在处理中
        console.log("其他线程在处理中");
        return null;
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 获取指定的key中field字段的值
   * @param key key
   * @param field 字段
   */
  public async hget(key: string, field: string) {
    try {
      return await this.redis.hget(key, field);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 向list中压入元素
   * @param key key
   * @param values values
   */
  public async lpush(key: string, values: Array<string>) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.lpush(key, values);
        // 处理完成后解锁
        this.unlockLock(lock);
        return res;
      } else {
        // 其他线程在处理中
        console.log("其他线程在处理中");
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 获取指定的key中所有键值对
   * @param key key
   */
  public async hgetall(key: string) {
    try {
      return await this.redis.hgetall(key);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 同时设置对个键值对数据
   * @param key key
   * @param value field,value,field,value,field,value
   */
  public async hmset(key: string, value: []) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.hmset(key, value);
        // 处理完成后解锁
        this.unlockLock(lock);
        return res;
      } else {
        // 其他线程在处理中
        console.log("其他线程在处理中");
        return null;
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 有序集合添加成员
   * @param key key
   * @param score 分数(按照此对象排名)
   * @param value value
   */
  public async zadd(key: string, score: number, value: string) {
    try {
      const lock = await this.lock(key);
      if (lock) {
        const res = await this.redis.zadd(key, score, value);
        // 处理完成后解锁
        this.unlockLock(lock);
        return res;
      } else {
        // 其他线程在处理中
        console.log("其他线程在处理中");
        return null;
      }

    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * HyperLogLog是一种概率性数据结构，在标准误差0.81%的前提下，能够统计2^64个数据。
   * 参考资料:https://juejin.im/post/6844904097666039816
   *         https://juejin.im/post/6844903940585160718
   */
  /**
   * HyperLogLog
   *  添加一个元素，如果重复，只算作一个
   * @param key key
   * @param score 分数(按照此对象排名)
   * @param value value
   */
  public async pfadd(key: string, value: string) {
    try {
      const res = await this.redis.pfadd(key, value);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * HyperLogLog
   * 返回元素数量的近似值
   * @param key key
   */
  public async pfcount(key: string) {
    try {
      const res = await this.redis.pfcount(key);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * HyperLogLog
   * 将多个 HyperLogLog 合并为一个 HyperLogLog
   * return OK.
   * @param key key
   */
  public async pfmerge(key: string, sourcekey: any[]) {
    try {
      const res = await this.redis.pfmerge(key, sourcekey);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 在redis 2.2.0版本之后，新增了一个位图数据，其实它不是一种数据结构。实际上它就是一个一个字符串结构，
   * 只不过value是一个二进制数据， 每一位只能是0或者1。redis单独对bitmap提供了一套命令。可以对任意一位进行设置和读取,
   * https://blog.csdn.net/u011957758/article/details/74783347。
   * bitmap
   * @param key key
   * @param offset 第offset位(：给一个指定key的值得第offset位 赋值为value。)
   * @param value 值:0-1
   */
  public async setbit(key: string, offset: number, value: string) {
    try {
      const res = await this.redis.setbit(key, offset, value);
      return res;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 判断是否存在指定key
   * @param key key
   */
  public async exists(key: string) {
    try {
      return await this.redis.exists(key);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 设置key过期时间
   * 成功返回1, 失败返回0, 报错返回null
   * @param key key
   * @param expiration 单位长度:秒
   */
  public expire(key: string, expiration: number) {
    try {
      return this.redis.expire(key, expiration);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return null;
    }
  }

  /**
   * 批量获取
   * @param pattern 需要匹配key的开头
   * @param amountPerScan 每次scan的槽位
   * @returns 
   */
  public async scan(pattern: string, amountPerScan: number): Promise<string[]> {
    let _self = this.redis;
    const startCursor: string = '0';
    let keys: any[] = [];

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
            //去重
            return resolve(Array.from(new Set(keys)));
          } else {
            return scanNext(cursor);
          }
        });
      }
      scanNext();
    });
  }

  public async scan2(key: string) {
    const startCursor = 0;
    const result: string[] = [];
    //@ts-ignore
    const start = (cursor = startCursor) => {
      const match = key;

      return this.redis.scan(cursor, "MATCH", match, "COUNT", 300).then((response: any) => {
        const [cursor, elements] = response;
        result.push(...elements);
        const _cursor = Number(cursor);
        if (_cursor === 0) {
          return;
        }
        return start(Number(cursor));
      });
    };

    return start().then(() => Array.from(new Set(result)));
  }

  public unlink(key: string) {
    return this.redis.unlink(key);
  }

  /**
   * 优雅的删除redis中的某一类key
   * @param pattern 'hello*'
   * @param time  间隔多少秒删除一条数据
   */
  public async goodDEl(pattern: string, time: number) {
    let result = await this.scan(pattern, 100);
    //@ts-ignore
    console.info(`[RedisTool]:goodDEl 一共需要删除key的数量`, result.length);
    //@ts-ignore
    for (let key of result) {
      console.info(`[RedisTool]:goodDEl 已经删除的key`, key);
      await new Promise(resolve => setTimeout(resolve, time * 1000));
      await this.unlink(key);
    }
  }

}

/**
 * 需要用到多少个数据库，就定义多少个实例常量，这样的好处是:
 * 每次个模块调用redis的时候，始终是取第一次生成的实例，避免了多次连接redis的尴尬
 * 
 */
export const redis_tool = new RedisTool(redis);
