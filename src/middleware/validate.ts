import { Context, Next } from 'koa';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../util/logger';

/**
 * Zod 校验中间件
 * @param schema Zod Schema
 * @param source 数据来源: 'body' | 'query' | 'params'
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (ctx: Context, next: Next) => {
    try {
      const data = source === 'body' ? ctx.request.body : source === 'query' ? ctx.query : ctx.params;
      const validated = await schema.parseAsync(data);

      // 将校验后的数据存入 ctx.state，方便后续使用
      ctx.state.validated = validated;

      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        logger.warn({
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
      } else {
        throw error;
      }
    }
  };
}
