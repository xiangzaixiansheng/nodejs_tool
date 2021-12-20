"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("./redis");
function createConnection() {
    return Promise.all([
        redis_1.createRedisConnection().then(() => console.log("redis已连接")),
    ]).catch(err => {
        console.error(`redis连接失败: ${err.message}`);
        return Promise.reject(err);
    });
}
exports.default = createConnection;
