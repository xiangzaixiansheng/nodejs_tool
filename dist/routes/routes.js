"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRouter = void 0;
const fs = require("fs");
const path = require("path");
const path_1 = require("path");
require("reflect-metadata");
const constants_1 = require("../constant/constants");
const ctrPath = path_1.resolve(__dirname, "../controllers");
const addRouter = (router) => {
    let derName = "";
    recursion(ctrPath);
    function recursion(folderName) {
        fs.readdirSync(folderName).forEach((name) => {
            if (/^[^.]+\.ts$/.test(name)) {
                binding(require(path.join(folderName, name)).default, derName);
                return true;
            }
            const fileN = path.join(folderName, name);
            const file = fs.lstatSync(fileN);
            if (file.isDirectory()) {
                derName = (derName + "/" + name);
                recursion(fileN);
                derName = "";
            }
        });
    }
    function binding(m, derName) {
        const routerMap = Reflect.getMetadata(constants_1.ROUTER_MAP, m, "method") || [];
        if (routerMap.length) {
            const ctr = new m();
            routerMap.forEach((route) => {
                const path = derName + route.path;
                const name = route.name;
                const method = route.method;
                const obj = ctr[name].bind(ctr);
                router[method](path, obj);
                console.log("添加路由成功:" + path);
            });
        }
    }
};
exports.addRouter = addRouter;
