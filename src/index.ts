import cors = require("@koa/cors");
import { getLimiterConfig } from "./util/limiterReq";
import { addRouter } from "./routes/routes";
import { limiterRedis, redisDb0 } from "./util/redisTool";
const ratelimit = require("koa-ratelimit");
const koaBody = require("koa-body");

import Koa, { Context } from 'koa';              // 导入koa
import Router from "koa-router";    // 导入koa-router

class App {
    /**
    * Koa对象
    */
    private readonly app: Koa;
    /**
     * Router对象
     */
    private readonly router: Router;
    constructor() {
        this.app = new Koa();
        this.router = new Router();
        this.init().catch((error) => {
            // tslint:disable-next-line:no-console
            console.log(error);
        });
    }

    private async init() {
        // koa(这个放第一个,要不然跨域会无效)
        this.app.use(cors());

        // 接收文件上传
        this.app.use(koaBody({
            "multipart": true,
            "formidable": {
                "maxFileSize": 200 * 1024 * 1024	// 设置上传文件大小最大限制，默认2M
            }
        }));

        // http请求次数限制(目前使用用户的ip来限制的)
        this.app.use(ratelimit((getLimiterConfig((ctx: Context) => ctx.ip, limiterRedis))));

        // add route
        addRouter(this.router);
        this.app.use(this.router.routes()).use(this.router.allowedMethods());

        // deal 404
        this.app.use(async (ctx: Context) => {
            ctx.status = 404;
            ctx.body = '404! content not found !';
        });
    }

    public start() {
        this.app.listen(8080, () => {
            console.log("Server running on http://localhost:8080");
        });
    }
}

//启动服务
const app = new App();

app.start();