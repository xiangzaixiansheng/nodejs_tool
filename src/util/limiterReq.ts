import { Redis } from 'ioredis';
import { Context } from 'koa';

export function getLimiterConfig(id: (ctx: Context) => string, redis: Redis) {
    const body = {
        statusCode: 200,
        data: {
            code: 429,
            msg: "操作失败!,请求次数过快!",
        },
    };

    return {
        driver: "redis",
        db: redis,
        duration: 3000,
        errorMessage: body,
        id,
        headers: {
            "Retry-After": "10000",
            "reset": "Limit",
            "total": "Limit",
        },
        max: 10,
        disableHeader: false,
        whitelist: (_ctx: unknown): boolean | undefined => {
            return undefined;
        },
        blacklist: (_ctx: unknown): boolean | undefined => {
            return undefined;
        },
    };
}
