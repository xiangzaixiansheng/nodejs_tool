"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_default_1 = __importDefault(require("./config.default"));
const env = process.env.NODE_ENV || "dev";
const config = require(`./config.${env}`).default;
if (!config) {
    throw new Error(`未找到该环境下的配置文件：${env}`);
}
exports.default = () => {
    return Object.assign(Object.assign({}, config_default_1.default), config);
};
