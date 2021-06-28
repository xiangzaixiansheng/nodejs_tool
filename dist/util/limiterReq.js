"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLimiterConfig = void 0;
const getLimiterConfig = (id, redis) => {
    const body = {
        "statusCode": 200,
        "data": {
            "code": 429,
            "msg": "操作失败!,请求次数过快!"
        },
    };
    return {
        "driver": "redis",
        "db": redis,
        "duration": 3000,
        "errorMessage": body,
        "id": id,
        "headers": {
            "Retry-After": "10000",
            "reset": "Limit",
            "total": "Limit"
        },
        "max": 10,
        "disableHeader": false,
        "whitelist": (ctx) => {
        },
        "blacklist": (ctx) => {
        }
    };
};
exports.getLimiterConfig = getLimiterConfig;
