import { Redis } from 'ioredis';
import { Context } from 'koa';
export declare function getLimiterConfig(id: (ctx: Context) => string, redis: Redis): {
    driver: string;
    db: Redis;
    duration: number;
    errorMessage: {
        statusCode: number;
        data: {
            code: number;
            msg: string;
        };
    };
    id: (ctx: Context) => string;
    headers: {
        "Retry-After": string;
        reset: string;
        total: string;
    };
    max: number;
    disableHeader: boolean;
    whitelist: (_ctx: unknown) => boolean | undefined;
    blacklist: (_ctx: unknown) => boolean | undefined;
};
//# sourceMappingURL=limiterReq.d.ts.map