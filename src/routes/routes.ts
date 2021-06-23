import Router = require("@koa/router");
import fs = require("fs");
import path = require("path");
import { resolve } from "path";
import "reflect-metadata";
// 路由配置
const ROUTER_MAP = Symbol("route_map");

/**
 * 路由类型
 */
type RouteMeta = {
	/**
	 * 路由名称
	 */
    name: string;
	/**
	 * 方法名称
	 */
    method: string;
	/**
	 * 路径
	 */
    path: string;
};

//controllers下的路径
const ctrPath = resolve(__dirname, "../controllers");

/**
 * @desc：路由自动扫描，获取controllers文件夹下面的文件，并通过装饰器添加请求
 */
const addRouter = (router: any) => {
    // 递归扫描controller文件夹，收集所有controller
    // 文件夹名称单独定义不能放在递归方法
    let derName = "";
    recursion(ctrPath);

	/**
	 * 递归获取所有ts文件添加到路由
	 * @param m 方法
	 * @param derName 文件名
	 */
    // tslint:disable-next-line:completed-docs
    function recursion(folderName: string) {
        // 递归扫描所有文件夹内的文件添加到路由
        // 拿到具体文件
        fs.readdirSync(folderName).forEach((name) => {

            if (/^[^.]+\.ts$/.test(name)) {
                binding(require(path.join(folderName, name)).default, derName);
                return true;
            }

            // 拿到子文件路径
            const fileN = path.join(folderName, name);
            // 转换文件对象
            const file = fs.lstatSync(fileN);
            // 是文件夹递归调用
            if (file.isDirectory()) {
                // 叠加文件夹名称递归调用
                derName = (derName + "/" + name);
                recursion(fileN);
                // 第一次循环结束初始化文件夹名称
                derName = "";
            }
        });
    }

	/**
	 * 结合meta数据添加路由
	 * @param m 方法
	 * @param derName 文件名
	 */
    // tslint:disable-next-line:completed-docs
    function binding(m: ObjectConstructor, derName: string) {
        const routerMap: RouteMeta[] = Reflect.getMetadata(ROUTER_MAP, m, "method") || [];
        if (routerMap.length) {
            const ctr: any = new m();
            routerMap.forEach((route) => {
                // const { name, method, path } = route;
                const path: string = derName + route.path;
                const name: string = route.name;
                const method: string = route.method;
                const obj: string = ctr[name].bind(ctr);
                // router[method](path, ctr[name].bind(ctr));
                router[method](path, obj);
                console.log("添加路由成功:" + path);
            });
        }
    }
};

export { addRouter };
