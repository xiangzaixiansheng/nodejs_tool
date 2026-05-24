import { Context, Next } from 'koa';
import { verifyToken, JwtPayload } from '../util/jwt';
import { logger } from '../util/logger';

// 扩展 Koa Context 类型
declare module 'koa' {
  interface Context {
    user?: JwtPayload;
  }
}

/**
 * JWT 认证中间件
 * 从请求头中提取 Authorization: Bearer <token>
 */
export async function authMiddleware(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      error: '缺少认证信息',
      requestId: ctx.state.requestId,
    };
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    ctx.status = 401;
    ctx.body = {
      success: false,
      error: '认证格式错误，请使用 Bearer <token>',
      requestId: ctx.state.requestId,
    };
    return;
  }

  const token = parts[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      error: 'Token 不能为空',
      requestId: ctx.state.requestId,
    };
    return;
  }

  try {
    const payload = verifyToken(token);
    ctx.user = payload;
    await next();
  } catch (err: any) {
    logger.warn({
      requestId: ctx.state.requestId,
      error: err.message,
    }, 'JWT 验证失败');

    ctx.status = 401;
    ctx.body = {
      success: false,
      error: 'Token 无效或已过期',
      requestId: ctx.state.requestId,
    };
  }
}

/**
 * 可选认证中间件
 * 有 token 则解析，无 token 也继续
 */
export async function optionalAuthMiddleware(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
      try {
        const payload = verifyToken(parts[1]);
        ctx.user = payload;
      } catch {
        // 忽略错误，继续执行
      }
    }
  }

  await next();
}
