import { Context, Next } from 'koa';
import { randomUUID } from 'crypto';

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，用于链路追踪
 */
export async function requestIdMiddleware(ctx: Context, next: Next) {
  const requestId = ctx.get('X-Request-Id') || randomUUID();
  ctx.state.requestId = requestId;
  ctx.set('X-Request-Id', requestId);
  await next();
}
