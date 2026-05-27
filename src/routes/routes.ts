import * as fs from "fs";
import * as path from "path";
import { resolve } from "path";
import "reflect-metadata";
import multer from "@koa/multer";
import { ROUTER_MAP } from '../constant/constants';
import { logger } from '../util/logger';

/**
 * 路由类型
 */
type RouteMeta = {
    name: string;
    method: string;
    path: string;
};

// controllers下的路径
const ctrPath = resolve(__dirname, "../controllers");

// 上传目录
const uploadDir = resolve(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// multer 配置
const uploadMiddleware = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
});

/**
 * @desc：路由自动扫描，获取controllers文件夹下面的文件，并通过装饰器添加请求
 */
const addRouter = async (router: any) => {
    // 递归扫描controller文件夹，收集所有controller
    await recursion(ctrPath, "");

    /**
     * 递归获取所有ts文件添加到路由
     * @param folderName 文件夹路径
     * @param prefix 路由前缀
     */
    async function recursion(folderName: string, prefix: string) {
        const files = fs.readdirSync(folderName);
        for (const name of files) {
            const filePath = path.join(folderName, name);
            const file = fs.lstatSync(filePath);

            // 是文件夹递归调用
            if (file.isDirectory()) {
                const newPrefix = prefix ? `${prefix}/${name}` : `/${name}`;
                await recursion(filePath, newPrefix);
                continue;
            }

            // fix: 修复build后的产物也可以加载router
            if (/^[^.]+\.(ts|js)$/.test(name)) {
                const module = await import(filePath);
                // 支持命名导出 (Controller) 或默认导出
                const Controller = module.Controller || module.default;
                if (Controller) {
                    binding(Controller, prefix);
                }
            }
        }
    }

    /**
     * 结合meta数据添加路由
     * @param m 控制器类
     * @param prefix 路由前缀
     */
    function binding(m: ObjectConstructor, prefix: string) {
        const routerMap: RouteMeta[] = Reflect.getMetadata(ROUTER_MAP, m, "method") || [];
        if (routerMap.length) {
            const ctr: any = new m();
            routerMap.forEach((route) => {
                const routePath: string = prefix + route.path;
                const obj = ctr[route.name].bind(ctr);

                // uploadFile 路由使用 multer 中间件
                if (route.name === "uploadFile" && route.method === "post") {
                    router.post(routePath, uploadMiddleware.single('file'), obj);
                } else {
                    router[route.method](routePath, obj);
                }
                logger.debug("Route registered: " + routePath);
            });
        }
    }
};

export { addRouter };