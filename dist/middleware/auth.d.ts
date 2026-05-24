import { Context, Next } from 'koa';
import { JwtPayload } from '../util/jwt';
declare module 'koa' {
    interface Context {
        user?: JwtPayload;
    }
}
export declare function authMiddleware(ctx: Context, next: Next): Promise<void>;
export declare function optionalAuthMiddleware(ctx: Context, next: Next): Promise<void>;
//# sourceMappingURL=auth.d.ts.map