"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRouter = void 0;
const fs = require("fs");
const path = require("path");
const path_1 = require("path");
require("reflect-metadata");
const constants_1 = require("../constant/constants");
const ctrPath = (0, path_1.resolve)(__dirname, "../controllers");
const addRouter = (router) => {
    recursion(ctrPath, "");
    function recursion(folderName, prefix) {
        fs.readdirSync(folderName).forEach((name) => {
            const filePath = path.join(folderName, name);
            const file = fs.lstatSync(filePath);
            if (file.isDirectory()) {
                const newPrefix = prefix ? `${prefix}/${name}` : `/${name}`;
                recursion(filePath, newPrefix);
                return;
            }
            if (/^[^.]+\.(ts|js)$/.test(name)) {
                binding(require(filePath).default, prefix);
            }
        });
    }
    function binding(m, prefix) {
        const routerMap = Reflect.getMetadata(constants_1.ROUTER_MAP, m, "method") || [];
        if (routerMap.length) {
            const ctr = new m();
            routerMap.forEach((route) => {
                const routePath = prefix + route.path;
                const obj = ctr[route.name].bind(ctr);
                router[route.method](routePath, obj);
                console.log("添加路由成功:" + routePath);
            });
        }
    }
};
exports.addRouter = addRouter;
//# sourceMappingURL=routes.js.map