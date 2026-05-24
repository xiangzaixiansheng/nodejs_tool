"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delValidate = exports.putValidate = exports.getValidate = exports.postValidate = void 0;
exports.createValidatedMethod = createValidatedMethod;
exports.applyValidation = applyValidation;
const constants_1 = require("../../constant/constants");
function createValidatedMethod(method) {
    return function (path, options) {
        return (proto, name) => {
            const target = proto.constructor;
            const routeMap = Reflect.getMetadata(constants_1.ROUTER_MAP, target, 'method') || [];
            routeMap.push({
                name,
                method,
                path,
                isVerify: options?.isVerify ?? false,
                schema: options?.schema,
                source: options?.source ?? 'body',
            });
            Reflect.defineMetadata(constants_1.ROUTER_MAP, routeMap, target, 'method');
        };
    };
}
exports.postValidate = createValidatedMethod('post');
exports.getValidate = createValidatedMethod('get');
exports.putValidate = createValidatedMethod('put');
exports.delValidate = createValidatedMethod('del');
async function applyValidation(ctx, route) {
    if (!route.schema)
        return true;
    try {
        const data = route.source === 'body'
            ? ctx.request.body
            : route.source === 'query'
                ? ctx.query
                : ctx.params;
        const validated = await route.schema.parseAsync(data);
        ctx.state.validated = validated;
        return true;
    }
    catch (error) {
        ctx.status = 400;
        ctx.body = {
            success: false,
            error: '参数校验失败',
            details: error.errors?.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
            requestId: ctx.state.requestId,
        };
        return false;
    }
}
//# sourceMappingURL=validate.js.map