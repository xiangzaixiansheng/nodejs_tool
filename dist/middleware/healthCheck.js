"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
exports.readyCheck = readyCheck;
const redis_1 = require("../glues/redis");
const mysql_1 = require("../glues/mysql");
async function healthCheck(ctx) {
    const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
    };
    ctx.status = 200;
    ctx.body = status;
}
async function readyCheck(ctx) {
    const checks = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        checks: {
            database: false,
            redis: false,
        },
    };
    try {
        await redis_1.redis.ping();
        checks.checks.redis = true;
    }
    catch (err) {
        checks.status = 'error';
    }
    try {
        const dataSource = (0, mysql_1.getDataSource)();
        if (dataSource.isInitialized) {
            await dataSource.query('SELECT 1');
            checks.checks.database = true;
        }
    }
    catch (err) {
        checks.status = 'error';
    }
    ctx.status = checks.status === 'ok' ? 200 : 503;
    ctx.body = checks;
}
//# sourceMappingURL=healthCheck.js.map