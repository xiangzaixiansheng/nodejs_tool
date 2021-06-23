import { redisDb1 } from './util/redisTool';
import cors = require("@koa/cors");
import { addRouter } from "./routes/routes";
const ratelimit = require("koa-ratelimit");
const koaBody = require("koa-body");

import Koa from 'koa';              // 导入koa
import Router from "koa-router";    // 导入koa-router

export class App {
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
        // add route
        addRouter(this.router);
        this.app.use(this.router.routes()).use(this.router.allowedMethods());
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