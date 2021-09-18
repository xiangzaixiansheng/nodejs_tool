import { Context, Next } from 'koa'
import { LogPath } from '../constant/constants'

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

// 这个是判断是否有logs目录，没有就新建，用来存放日志
const logsDir = path.parse(LogPath).dir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}
// 配置log4.js
log4js.configure({
  appenders: {
    console: { type: 'console' },
    dateFile: {
      type: 'dateFile',
      filename: LogPath,
      daysToKeep: 3,
      pattern: '-yyyy-MM-dd',
    },
  },
  categories: {
    default: {
      appenders: ['console', 'dateFile'],
      level: 'debug',//error
    },
  },
})

/**
 * @param {*} req ctx.req
 * @method 获取客户端ip地址
 */
function getClientIp(req: any) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

function isMobile(userAgent: any) {
  // 判断是移动端还是pc端
  return /Mobile/.test(userAgent) ? 'Mobile' : 'PC';
}

const format_log = (ctx: any, responseTime: number) => {
  let client = {
    ip: getClientIp(ctx.req),
    method: ctx.request.method,
    path: ctx.request.path,
    referer: ctx.request.headers['referer'],
    userAgent: isMobile(ctx.request.headers['user-agent']),
    responseTime
  }
  // 返回客户端信息交给logger打印
  return JSON.stringify(client);
}

export const logger = log4js.getLogger('[Default]')

// logger中间件
export const loggerMiddleware = async (ctx: Context, next: Next) => {
  // 请求开始时间
  const start = +new Date();
  await next()
  // 结束时间
  const ms = +new Date() - start;
  logger.info(format_log(ctx, ms));
}

