"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("@koa/cors");
const limiterReq_1 = require("./util/limiterReq");
const routes_1 = require("./routes/routes");
const redis_1 = require("./glues/redis");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ratelimit = require("koa-ratelimit");
const koaBody = require("koa-body");
const serve = require("koa-static");
const views = require("koa-views");
const uploadDir = __dirname + "/uploads";
fs.ensureDir(uploadDir);
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const glues_1 = __importDefault(require("./glues"));
const logger_1 = require("./util/logger");
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
        this.app.use(logger_1.loggerMiddleware);
        await glues_1.default();
        this.app.use(serve(path.join(__dirname, process.env.NODE_ENV === "dev" ? "../public" : "./public"), {
            index: false,
            hidden: false,
            defter: true,
        }));
        this.app.use(views("public", {
            map: {
                html: "ejs"
            }
        }));
        this.app.use(koaBody({
            "multipart": true,
            "formidable": {
                uploadDir,
                keepExtensions: true,
            }
        }));
        this.app.use(ratelimit((limiterReq_1.getLimiterConfig((ctx) => ctx.ip, redis_1.redis))));
        routes_1.addRouter(this.router);
        this.app.use(this.router.routes()).use(this.router.allowedMethods());
        this.app.use(async (ctx) => {
            ctx.status = 404;
            ctx.body = '404! content not found !';
        });
    }
    start() {
        this.app.listen(3000, () => {
            console.log("Server running on http://localhost:3000");
        });
    }
}
const app = new App();
app.start();
