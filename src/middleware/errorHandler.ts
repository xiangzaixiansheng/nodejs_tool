import { Context, Next } from 'koa';
import { logger } from '../util/logger';

/**
 * 全局错误处理中间件
 * 捕获所有未处理的异常，统一返回格式
 */
export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    const requestId = ctx.state.requestId || 'unknown';

    // 记录错误日志
    logger.error({
      requestId,
      error: err.message,
      stack: err.stack,
      path: ctx.path,
      method: ctx.method,
    });

    // 根据错误类型返回不同状态码
    if (err.name === 'ValidationError') {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: '参数校验失败',
        message: err.message,
        requestId,
      };
    } else if (err.name === 'UnauthorizedError') {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: '未授权',
        message: err.message,
        requestId,
      };
    } else if (err.name === 'ForbiddenError') {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: '禁止访问',
        message: err.message,
        requestId,
      };
    } else if (err.status === 404 || err.statusCode === 404) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: '资源不存在',
        requestId,
      };
    } else {
      ctx.status = err.status || err.statusCode || 500;
      ctx.body = {
        success: false,
        error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
        requestId,
      };
    }
  }
}
