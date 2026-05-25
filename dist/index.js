"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });
const cors_1 = __importDefault(require("@koa/cors"));
const bodyparser_1 = require("@koa/bodyparser");
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const koa_ratelimit_1 = __importDefault(require("koa-ratelimit"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_views_1 = __importDefault(require("koa-views"));
const routes_1 = require("./routes/routes");
const swagger_1 = __importStar(require("./routes/swagger"));
const redis_1 = require("./glues/redis");
const glues_1 = __importDefault(require("./glues"));
const mysql_1 = require("./glues/mysql");
const logger_1 = require("./util/logger");
const fileTool_1 = require("./util/fileTool");
const limiterReq_1 = require("./util/limiterReq");
const config_1 = require("./config");
const BullModule_1 = require("./util/BullModule");
const errorHandler_1 = require("./middleware/errorHandler");
const requestId_1 = require("./middleware/requestId");
const healthCheck_1 = require("./middleware/healthCheck");
const multer_1 = __importDefault(require("@koa/multer"));
const config = (0, config_1.getConfigSync)();
const uploadDir = __dirname + "/uploads";
fs.mkdirSync(uploadDir, { recursive: true });
class App {
    app;
    router;
    server;
    constructor() {
        this.app = new koa_1.default();
        this.router = new router_1.default();
        this.init().catch((error) => {
            logger_1.logger.error('App initialization failed:', error);
            process.exit(1);
        });
    }
    async init() {
        this.app.use(errorHandler_1.errorHandler);
        this.app.use(requestId_1.requestIdMiddleware);
        this.app.use((0, cors_1.default)());
        this.app.use(logger_1.loggerMiddleware);
        this.app.use((0, koa_static_1.default)(path.join(__dirname, process.env.NODE_ENV === "dev" ? "../public" : "./public"), {
            hidden: false,
            defer: false,
        }));
        this.app.use((0, koa_views_1.default)("public", {
            map: { html: "ejs" }
        }));
        this.app.use((0, bodyparser_1.bodyParser)());
        this.app.use(swagger_1.swaggerUi);
        this.app.use(swagger_1.default.routes()).use(swagger_1.default.allowedMethods());
        this.router.get('/health', healthCheck_1.healthCheck);
        this.router.get('/health/ready', healthCheck_1.readyCheck);
        await (0, glues_1.default)();
        this.app.use(async (ctx, next) => {
            if (ctx.path.startsWith('/upload/')) {
                return next();
            }
            return (0, koa_ratelimit_1.default)((0, limiterReq_1.getLimiterConfig)((ctx) => ctx.ip, redis_1.redis))(ctx, next);
        });
        const chunkUpload = (0, multer_1.default)({
            storage: multer_1.default.diskStorage({
                destination: (_req, _file, cb) => {
                    const tempDir = path.join(uploadDir, "temp");
                    fs.mkdirSync(tempDir, { recursive: true });
                    cb(null, tempDir);
                },
                filename: (_req, file, cb) => {
                    cb(null, `${Date.now()}-${file.originalname}`);
                },
            }),
            limits: { fileSize: 100 * 1024 * 1024 },
        });
        this.router.post('/upload/chunk', chunkUpload.single('chunk'), async (ctx) => {
            const { UploadController } = await Promise.resolve().then(() => __importStar(require("./controllers/upload/upload")));
            const ctrl = new UploadController();
            await ctrl.uploadChunk(ctx);
        });
        const uploadFilesRouter = new router_1.default({ prefix: '/uploads/files' });
        uploadFilesRouter.get('/(.*)', async (ctx) => {
            const filePath = path.join(uploadDir, 'files', ctx.params[0] || '');
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                ctx.set('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
                ctx.body = fs.createReadStream(filePath);
            }
            else {
                ctx.status = 404;
                ctx.body = { success: false, error: '文件不存在' };
            }
        });
        this.app.use(uploadFilesRouter.routes());
        await (0, routes_1.addRouter)(this.router);
        this.app.use(this.router.routes()).use(this.router.allowedMethods());
        this.app.use(async (ctx) => {
            ctx.status = 404;
            ctx.body = {
                success: false,
                error: '资源不存在',
                requestId: ctx.state.requestId,
            };
        });
    }
    start() {
        const port = config.port;
        this.server = this.app.listen(port, () => {
            logger_1.logger.info(`Server running on http://localhost:${port}`);
            const IP = (0, fileTool_1.getIp)();
            logger_1.logger.info(`本机ip: ${IP}`);
            logger_1.logger.info(`curl -F "file=@文件名" -X POST "http://${IP}:${port}/api/uploadFile"`);
        });
        this.setupGracefulShutdown();
    }
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, starting graceful shutdown...`);
            this.server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    const dataSource = (0, mysql_1.getDataSource)();
                    await dataSource.destroy();
                    logger_1.logger.info('Database connection closed');
                    await redis_1.redis.quit();
                    logger_1.logger.info('Redis connection closed');
                    await BullModule_1.bullModule.close();
                    logger_1.logger.info('BullMQ closed');
                    logger_1.logger.info('Graceful shutdown completed');
                    process.exit(0);
                }
                catch (err) {
                    logger_1.logger.error('Error during shutdown:', err);
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}
const app = new App();
app.start();
//# sourceMappingURL=index.js.map