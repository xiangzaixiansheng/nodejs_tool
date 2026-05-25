"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createConnection;
const mysql_1 = require("./mysql");
const redis_1 = require("./redis");
const logger_1 = require("../util/logger");
function createConnection() {
    return Promise.all([
        (0, redis_1.createRedisConnection)().then(() => logger_1.logger.info("Redis connected")),
        (0, mysql_1.createMysqlConnection)().then(() => logger_1.logger.info("MySQL connected"))
    ]).catch(err => {
        logger_1.logger.error(`Connection failed: ${err.message}`);
        return Promise.reject(err);
    });
}
//# sourceMappingURL=index.js.map