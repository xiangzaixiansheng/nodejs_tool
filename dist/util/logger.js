"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = exports.logger = void 0;
const constants_1 = require("../constant/constants");
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const logsDir = path.parse(constants_1.LogPath).dir;
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
log4js.configure({
    appenders: {
        console: { type: 'console' },
        dateFile: {
            type: 'dateFile',
            filename: constants_1.LogPath,
            daysToKeep: 3,
            pattern: '-yyyy-MM-dd',
        },
    },
    categories: {
        default: {
            appenders: ['console', 'dateFile'],
            level: 'debug',
        },
    },
});
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}
function isMobile(userAgent) {
    return /Mobile/.test(userAgent) ? 'Mobile' : 'PC';
}
const format_log = (ctx, responseTime) => {
    let client = {
        ip: getClientIp(ctx.req),
        method: ctx.request.method,
        path: ctx.request.path,
        referer: ctx.request.headers['referer'],
        userAgent: isMobile(ctx.request.headers['user-agent']),
        responseTime
    };
    return JSON.stringify(client);
};
exports.logger = log4js.getLogger('[Default]');
const loggerMiddleware = async (ctx, next) => {
    const start = +new Date();
    await next();
    const ms = +new Date() - start;
    exports.logger.info(format_log(ctx, ms));
};
exports.loggerMiddleware = loggerMiddleware;
