import cors = require("@koa/cors");
import { getLimiterConfig } from "./util/limiterReq";
import { addRouter } from "./routes/routes";
import { redis } from "./glues/redis";
import * as path from "path";
import * as fs from "fs-extra";

const ratelimit = require("koa-ratelimit");
const koaBody = require("koa-body");

const serve = require("koa-static");
const views = require("koa-views");


const uploadDir = __dirname + "/uploads";
fs.ensureDir(uploadDir);


import Koa, { Context } from 'koa';              // 导入koa
import Router from "koa-router";    // 导入koa-router
import createConnection from "./glues";
import { loggerMiddleware } from './util/logger'
import { profiler } from "./util/v8Profiler";

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

        // Logger
        this.app.use(loggerMiddleware);

        //链接数据库
        await createConnection();
        //把配置模板引擎的代码移动到所有与路由相关的代码之前, TypeError: ctx.render is not a function
        this.app.use(
            serve(
                path.join(
                    __dirname,
                    process.env.NODE_ENV === "dev" ? "../public" : "./public"
                ),
                {
                    index: false,
                    hidden: false,
                    defter: true,
                }
            )
        );

        this.app.use(
            views("public", {
                map: {
                    html: "ejs"
                }
            })
        )

        // 接收文件上传
        this.app.use(koaBody({
            "multipart": true,
            "formidable": {
                //"maxFileSize": 20 * 1024 * 1024,	// 设置上传文件大小最大限制，默认2M
                // 上传目录
                uploadDir,
                // 保留文件扩展名
                keepExtensions: true,
            }
        }));


        // http请求次数限制(目前使用用户的ip来限制的)
        this.app.use(ratelimit((getLimiterConfig((ctx: Context) => ctx.ip, redis))));

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
        this.app.listen(3000, () => {
            console.log("Server running on http://localhost:3000");
        });
    }
}

//启动服务
const app = new App();

app.start();

//记录v8快照的
//new profiler().start();