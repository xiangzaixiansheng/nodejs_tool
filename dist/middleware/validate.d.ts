import { Context, Next } from 'koa';
import { ZodSchema } from 'zod';
export declare function validate(schema: ZodSchema, source?: 'body' | 'query' | 'params'): (ctx: Context, next: Next) => Promise<void>;
//# sourceMappingURL=validate.d.ts.map