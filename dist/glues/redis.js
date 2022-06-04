"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.createRedisConnection = void 0;
const Redis = require("ioredis");
const config_1 = __importDefault(require("../config"));
let redis;
exports.redis = redis;
const redisConfig = config_1.default().redis;
function createRedisConnection() {
    if (redis) {
        return Promise.resolve('success');
    }
    exports.redis = redis = new Redis(redisConfig);
    return new Promise((resolve, reject) => {
        redis.on('connect', resolve);
        redis.on('error', reject);
    });
}
exports.createRedisConnection = createRedisConnection;
function RedisKeyExpire() {
    const db = redisConfig.db || "0";
    redis.send_command('config', ['set', 'notify-keyspace-events', 'Ex'])
        .then((res) => {
        const expired_subKey = `__keyevent@${db}__:expired`;
        const sub = new Redis(redisConfig);
        sub.subscribe(expired_subKey, function () {
            sub.on('message', function (info, expireKey) {
                console.info(`监听到过期的rediskey ${expireKey}`);
            });
        });
    }).catch((err) => {
        console.error("error", err);
    });
}
