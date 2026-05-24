"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../util/logger");
async function errorHandler(ctx, next) {
    try {
        await next();
    }
    catch (err) {
        const requestId = ctx.state.requestId || 'unknown';
        logger_1.logger.error({
            requestId,
            error: err.message,
            stack: err.stack,
            path: ctx.path,
            method: ctx.method,
        });
        if (err.name === 'ValidationError') {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: '参数校验失败',
                message: err.message,
                requestId,
            };
        }
        else if (err.name === 'UnauthorizedError') {
            ctx.status = 401;
            ctx.body = {
                success: false,
                error: '未授权',
                message: err.message,
                requestId,
            };
        }
        else if (err.name === 'ForbiddenError') {
            ctx.status = 403;
            ctx.body = {
                success: false,
                error: '禁止访问',
                message: err.message,
                requestId,
            };
        }
        else if (err.status === 404 || err.statusCode === 404) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                error: '资源不存在',
                requestId,
            };
        }
        else {
            ctx.status = err.status || err.statusCode || 500;
            ctx.body = {
                success: false,
                error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
                requestId,
            };
        }
    }
}
//# sourceMappingURL=errorHandler.js.map