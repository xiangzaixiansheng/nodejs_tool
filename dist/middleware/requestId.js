"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
async function requestIdMiddleware(ctx, next) {
    const requestId = ctx.get('X-Request-Id') || (0, crypto_1.randomUUID)();
    ctx.state.requestId = requestId;
    ctx.set('X-Request-Id', requestId);
    await next();
}
//# sourceMappingURL=requestId.js.map