//import * as Redis from "ioredis";
import Redis = require('ioredis');
import getConfig from "../config";

let redis: Redis.Redis;

/**
 * 初始化配置, 地址和端口
 */
const redisConfig = getConfig().redis;

export function createRedisConnection() {
    if (redis) {
        return Promise.resolve('success');
    }
    redis = new Redis(redisConfig);

    return new Promise((resolve, reject) => {
        redis.on('connect', resolve);
        redis.on('error', reject);
    })
}


export {
    redis
}