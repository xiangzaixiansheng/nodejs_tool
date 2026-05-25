import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import Koa, { Context } from 'koa';
import Router from "@koa/router";
import * as path from "path";
import * as fs from "fs";

import ratelimit from "koa-ratelimit";
import serve from "koa-static";
import views from "koa-views";

import { addRouter } from "./routes/routes";
import swaggerRouter, { swaggerUi } from "./routes/swagger";
import { redis } from "./glues/redis";
import createConnection from "./glues";
import { getDataSource } from "./glues/mysql";
import { loggerMiddleware, logger } from './util/logger';
import { getIp } from "./util/fileTool";
import { getLimiterConfig } from "./util/limiterReq";
import { getConfigSync } from "./config";
import { bullModule as BullModule } from "./util/BullModule";

import { errorHandler } from "./middleware/errorHandler";
import { requestIdMiddleware } from "./middleware/requestId";
import { healthCheck, readyCheck } from "./middleware/healthCheck";

const config = getConfigSync();
const uploadDir = __dirname + "/uploads";
fs.mkdirSync(uploadDir, { recursive: true });

class App {
    private readonly app: Koa;
    private readonly router: Router;
    private server: any;

    constructor() {
        this.app = new Koa();
        this.router = new Router();
        this.init().catch((error) => {
            logger.error('App initialization failed:', error);
            process.exit(1);
        });
    }

    private async init() {
        // 错误处理（放在最前面）
        this.app.use(errorHandler);

        // 请求 ID
        this.app.use(requestIdMiddleware);

        // CORS
        this.app.use(cors());

        // Logger
        this.app.use(loggerMiddleware);

        // 静态文件服务
        this.app.use(
            serve(
                path.join(
                    __dirname,
                    process.env.NODE_ENV === "dev" ? "../public" : "./public"
                ),
                {
                    index: false,
                    hidden: false,
                    defer: true,
                }
            )
        );

        // 模板引擎
        this.app.use(
            views("public", {
                map: { html: "ejs" }
            })
        );

        // Body parser
        this.app.use(bodyParser());

        // Swagger 文档（在限流之前）
        this.app.use(swaggerUi);
        this.app.use(swaggerRouter.routes()).use(swaggerRouter.allowedMethods());

        // 健康检查（在限流之前）
        this.router.get('/health', healthCheck);
        this.router.get('/health/ready', readyCheck);

        // 连接数据库
        await createConnection();

        // 限流
        this.app.use(ratelimit(getLimiterConfig((ctx: Context) => ctx.ip, redis)));

        // 路由
        await addRouter(this.router);
        this.app.use(this.router.routes()).use(this.router.allowedMethods());

        // 404 处理
        this.app.use(async (ctx: Context) => {
            ctx.status = 404;
            ctx.body = {
                success: false,
                error: '资源不存在',
                requestId: ctx.state.requestId,
            };
        });
    }

    public start() {
        const port = config.port;
        this.server = this.app.listen(port, () => {
            logger.info(`Server running on http://localhost:${port}`);
            const IP = getIp();
            logger.info(`本机ip: ${IP}`);
            logger.info(`curl -F "file=@文件名" -X POST "http://${IP}:${port}/api/uploadFile"`);
        });

        // 优雅关闭
        this.setupGracefulShutdown();
    }

    private setupGracefulShutdown() {
        const shutdown = async (signal: string) => {
            logger.info(`Received ${signal}, starting graceful shutdown...`);

            // 关闭 HTTP 服务器
            this.server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    // 关闭数据库连接
                    const dataSource = getDataSource();
                    await dataSource.destroy();
                    logger.info('Database connection closed');

                    // 关闭 Redis
                    await redis.quit();
                    logger.info('Redis connection closed');

                    // 关闭 BullMQ
                    await BullModule.close();
                    logger.info('BullMQ closed');

                    logger.info('Graceful shutdown completed');
                    process.exit(0);
                } catch (err) {
                    logger.error('Error during shutdown:', err);
                    process.exit(1);
                }
            });

            // 强制关闭超时
            setTimeout(() => {
                logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

const app = new App();
app.start();
