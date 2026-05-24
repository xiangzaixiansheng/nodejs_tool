import { ZodSchema } from 'zod';
import { ROUTER_MAP } from '../../constant/constants';

/**
 * 路由装饰器 + 校验组合
 * 简化在装饰器路由中使用 Zod 校验
 */

interface RouteMeta {
  name: string;
  method: string;
  path: string;
  isVerify?: boolean;
  schema?: ZodSchema;
  source?: 'body' | 'query' | 'params';
}

/**
 * 创建带校验的 HTTP 方法装饰器
 */
export function createValidatedMethod(method: string) {
  return function (path: string, options?: {
    schema?: ZodSchema;
    source?: 'body' | 'query' | 'params';
    isVerify?: boolean;
  }) {
    return (proto: any, name: string) => {
      const target = proto.constructor;
      const routeMap: RouteMeta[] = Reflect.getMetadata(ROUTER_MAP, target, 'method') || [];
      routeMap.push({
        name,
        method,
        path,
        isVerify: options?.isVerify ?? false,
        schema: options?.schema,
        source: options?.source ?? 'body',
      });
      Reflect.defineMetadata(ROUTER_MAP, routeMap, target, 'method');
    };
  };
}

/**
 * 带校验的 POST
 */
export const postValidate = createValidatedMethod('post');

/**
 * 带校验的 GET
 */
export const getValidate = createValidatedMethod('get');

/**
 * 带校验的 PUT
 */
export const putValidate = createValidatedMethod('put');

/**
 * 带校验的 DELETE
 */
export const delValidate = createValidatedMethod('del');

/**
 * 在路由扫描时应用校验
 * 需要在 routes.ts 中集成
 */
export async function applyValidation(ctx: any, route: RouteMeta): Promise<boolean> {
  if (!route.schema) return true;

  try {
    const data = route.source === 'body'
      ? ctx.request.body
      : route.source === 'query'
        ? ctx.query
        : ctx.params;

    const validated = await route.schema.parseAsync(data);
    ctx.state.validated = validated;
    return true;
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: '参数校验失败',
      details: error.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      requestId: ctx.state.requestId,
    };
    return false;
  }
}
