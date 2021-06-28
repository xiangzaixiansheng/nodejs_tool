"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env = process.env.NODE_ENV || "dev";
const config = require(`./config.${env}`).default;
if (!config) {
    throw new Error(`未找到该环境下的配置文件：${env}`);
}
exports.default = () => {
    return Object.assign({}, config);
};
