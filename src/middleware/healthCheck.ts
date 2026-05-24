import { Context } from 'koa';
import { redis } from '../glues/redis';
import { getDataSource } from '../glues/mysql';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

interface ReadyStatus extends HealthStatus {
  checks: {
    database: boolean;
    redis: boolean;
  };
}

/**
 * 健康检查 - 基本存活检测
 */
export async function healthCheck(ctx: Context) {
  const status: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  };

  ctx.status = 200;
  ctx.body = status;
}

/**
 * 就绪检查 - 检测依赖服务
 */
export async function readyCheck(ctx: Context) {
  const checks: ReadyStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: false,
      redis: false,
    },
  };

  // 检查 Redis
  try {
    await redis.ping();
    checks.checks.redis = true;
  } catch (err) {
    checks.status = 'error';
  }

  // 检查数据库
  try {
    const dataSource = getDataSource();
    if (dataSource.isInitialized) {
      await dataSource.query('SELECT 1');
      checks.checks.database = true;
    }
  } catch (err) {
    checks.status = 'error';
  }

  ctx.status = checks.status === 'ok' ? 200 : 503;
  ctx.body = checks;
}
