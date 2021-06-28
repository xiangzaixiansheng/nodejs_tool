"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("@koa/cors");
const limiterReq_1 = require("./util/limiterReq");
const routes_1 = require("./routes/routes");
const redisTool_1 = require("./util/redisTool");
const ratelimit = require("koa-ratelimit");
const koaBody = require("koa-body");
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
class App {
    constructor() {
        this.app = new koa_1.default();
        this.router = new koa_router_1.default();
        this.init().catch((error) => {
            console.log(error);
        });
    }
    async init() {
        this.app.use(cors());
        this.app.use(koaBody({
            "multipart": true,
            "formidable": {
                "maxFileSize": 200 * 1024 * 1024
            }
        }));
        this.app.use(ratelimit((limiterReq_1.getLimiterConfig((ctx) => ctx.ip, redisTool_1.limiterRedis))));
        routes_1.addRouter(this.router);
        this.app.use(this.router.routes()).use(this.router.allowedMethods());
        this.app.use(async (ctx) => {
            ctx.status = 404;
            ctx.body = '404! content not found !';
        });
    }
    start() {
        this.app.listen(8080, () => {
            console.log("Server running on http://localhost:8080");
        });
    }
}
const app = new App();
app.start();
