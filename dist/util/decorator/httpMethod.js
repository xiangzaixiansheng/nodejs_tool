"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = exports.head = exports.options = exports.patch = exports.put = exports.del = exports.get = exports.post = void 0;
require("reflect-metadata");
const constants_1 = require("../../constant/constants");
function createMethodDecorator(method) {
    return function httpMethodDecorator(path, isVerify) {
        return (proto, name) => {
            const target = proto.constructor;
            const routeMap = Reflect.getMetadata(constants_1.ROUTER_MAP, target, "method") || [];
            routeMap.push({ name, method, path, "isVerify": !!isVerify });
            Reflect.defineMetadata(constants_1.ROUTER_MAP, routeMap, target, "method");
        };
    };
}
exports.post = createMethodDecorator("post");
exports.get = createMethodDecorator("get");
exports.del = createMethodDecorator("del");
exports.put = createMethodDecorator("put");
exports.patch = createMethodDecorator("patch");
exports.options = createMethodDecorator("options");
exports.head = createMethodDecorator("head");
exports.all = createMethodDecorator("all");
