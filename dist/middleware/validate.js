"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const logger_1 = require("../util/logger");
function validate(schema, source = 'body') {
    return async (ctx, next) => {
        try {
            const data = source === 'body' ? ctx.request.body : source === 'query' ? ctx.query : ctx.params;
            const validated = await schema.parseAsync(data);
            ctx.state.validated = validated;
            await next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                logger_1.logger.warn({
                    requestId: ctx.state.requestId,
                    path: ctx.path,
                    errors: messages,
                }, '参数校验失败');
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    error: '参数校验失败',
                    details: messages,
                    requestId: ctx.state.requestId,
                };
            }
            else {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=validate.js.map