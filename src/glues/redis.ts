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
        //redis.on('connect', () => { RedisKeyExpire() });
        redis.on('error', reject);
    })
}

//监听redis过期的key
function RedisKeyExpire() {
    const db: string = redisConfig.db || "0";
    redis.send_command('config', ['set', 'notify-keyspace-events', 'Ex'])
        .then((res) => {
            const expired_subKey = `__keyevent@${db}__:expired`;
            const sub = new Redis(redisConfig);
            sub.subscribe(expired_subKey, function () {
                sub.on('message', function (info, expireKey) {
                    console.info(`监听到过期的rediskey ${expireKey}`)
                })
            })
        }).catch((err) => {
            console.error("error", err);
        })
}


export {
    redis
}