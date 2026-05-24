import Router from '@koa/router';
import { koaSwagger } from 'koa2-swagger-ui';
import { swaggerSpec } from '../config/swagger';

const router = new Router();

/**
 * @openapi
 * /swagger.json:
 *   get:
 *     summary: 获取 Swagger JSON 文档
 *     tags: [系统]
 */
router.get('/swagger.json', (ctx) => {
  ctx.body = swaggerSpec;
});

/**
 * Swagger UI
 */
export const swaggerUi = koaSwagger({
  routePrefix: '/api-docs',
  swaggerOptions: {
    url: '/swagger.json',
  },
});

export default router;
