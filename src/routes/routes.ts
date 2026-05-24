import fs = require("fs");
import path = require("path");
import { resolve } from "path";
import "reflect-metadata";
import { ROUTER_MAP } from '../constant/constants';

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

/**
 * @desc：路由自动扫描，获取controllers文件夹下面的文件，并通过装饰器添加请求
 */
const addRouter = (router: any) => {
    // 递归扫描controller文件夹，收集所有controller
    recursion(ctrPath, "");

    /**
     * 递归获取所有ts文件添加到路由
     * @param folderName 文件夹路径
     * @param prefix 路由前缀
     */
    function recursion(folderName: string, prefix: string) {
        fs.readdirSync(folderName).forEach((name) => {
            const filePath = path.join(folderName, name);
            const file = fs.lstatSync(filePath);

            // 是文件夹递归调用
            if (file.isDirectory()) {
                const newPrefix = prefix ? `${prefix}/${name}` : `/${name}`;
                recursion(filePath, newPrefix);
                return;
            }

            // fix: 修复build后的产物也可以加载router
            if (/^[^.]+\.(ts|js)$/.test(name)) {
                binding(require(filePath).default, prefix);
            }
        });
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
                router[route.method](routePath, obj);
                console.log("添加路由成功:" + routePath);
            });
        }
    }
};

export { addRouter };
