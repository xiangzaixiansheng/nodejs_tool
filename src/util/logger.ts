import { Context, Next } from 'koa';
import { LogPath } from '../constant/constants';
import * as fs from 'fs';
import * as path from 'path';
import log4js from 'log4js';

// 确保日志目录存在
const logsDir = path.parse(LogPath).dir;
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 配置 log4js
log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m%n',
      },
    },
    dateFile: {
      type: 'dateFile',
      filename: LogPath,
      numBackups: 7,
      pattern: '-yyyy-MM-dd',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m%n',
      },
    },
  },
  categories: {
    default: {
      appenders: ['console', 'dateFile'],
      level: process.env.LOG_LEVEL || 'debug',
    },
  },
});

function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    'unknown'
  );
}

function isMobile(userAgent: string): string {
  return /Mobile/.test(userAgent) ? 'Mobile' : 'PC';
}

interface LogEntry {
  timestamp: string;
  requestId: string;
  ip: string;
  method: string;
  path: string;
  referer?: string;
  userAgent: string;
  responseTime: number;
  statusCode?: number;
}

function formatLog(ctx: Context, responseTime: number): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId: ctx.state.requestId || 'unknown',
    ip: getClientIp(ctx.req),
    method: ctx.request.method,
    path: ctx.request.path,
    referer: ctx.request.headers['referer'] as string,
    userAgent: isMobile(ctx.request.headers['user-agent'] || ''),
    responseTime,
    statusCode: ctx.status,
  };
  return JSON.stringify(entry);
}

export const logger = log4js.getLogger('[App]');

// Logger 中间件
export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(formatLog(ctx, ms));
};
