"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("./mysql");
const redis_1 = require("./redis");
function createConnection() {
    return Promise.all([
        redis_1.createRedisConnection().then(() => console.log("redis已连接")),
        mysql_1.createMysqlConnection().then(() => console.log("mysql已连接"))
    ]).catch(err => {
        console.error(`连接失败: ${err.message}`);
        return Promise.reject(err);
    });
}
exports.default = createConnection;
