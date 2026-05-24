"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jwt_1 = require("../util/jwt");
const logger_1 = require("../util/logger");
async function authMiddleware(ctx, next) {
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = {
            success: false,
            error: '缺少认证信息',
            requestId: ctx.state.requestId,
        };
        return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        ctx.status = 401;
        ctx.body = {
            success: false,
            error: '认证格式错误，请使用 Bearer <token>',
            requestId: ctx.state.requestId,
        };
        return;
    }
    const token = parts[1];
    if (!token) {
        ctx.status = 401;
        ctx.body = {
            success: false,
            error: 'Token 不能为空',
            requestId: ctx.state.requestId,
        };
        return;
    }
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        ctx.user = payload;
        await next();
    }
    catch (err) {
        logger_1.logger.warn({
            requestId: ctx.state.requestId,
            error: err.message,
        }, 'JWT 验证失败');
        ctx.status = 401;
        ctx.body = {
            success: false,
            error: 'Token 无效或已过期',
            requestId: ctx.state.requestId,
        };
    }
}
async function optionalAuthMiddleware(ctx, next) {
    const authHeader = ctx.headers.authorization;
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
            try {
                const payload = (0, jwt_1.verifyToken)(parts[1]);
                ctx.user = payload;
            }
            catch {
            }
        }
    }
    await next();
}
//# sourceMappingURL=auth.js.map