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
