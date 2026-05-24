"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.createRedisConnection = createRedisConnection;
const ioredis_1 = require("ioredis");
const config_1 = __importDefault(require("../config"));
let redis;
const redisConfig = (0, config_1.default)().redis;
function createRedisConnection() {
    if (redis) {
        return Promise.resolve('success');
    }
    exports.redis = redis = new ioredis_1.Redis(redisConfig);
    return new Promise((resolve, reject) => {
        redis.on('connect', resolve);
        redis.on('error', reject);
    });
}
//# sourceMappingURL=redis.js.map