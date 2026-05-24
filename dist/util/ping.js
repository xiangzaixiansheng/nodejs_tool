"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping2 = exports.ping = void 0;
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const ping = async (proxyHost, proxyPort) => {
    try {
        const response = await axios_1.default.get('https://www.baidu.com/', {
            proxy: {
                host: proxyHost,
                port: parseInt(proxyPort, 10),
            },
            timeout: 5000,
        });
        if (response.status === 200) {
            console.log(`代理 ${proxyHost}:${proxyPort} 可用`);
            return true;
        }
        else {
            console.log(`代理 ${proxyHost}:${proxyPort} 响应异常，状态码：${response.status}`);
            return false;
        }
    }
    catch (error) {
        console.log(`代理 ${proxyHost}:${proxyPort} 不可用，错误信息：${error}`);
        return false;
    }
};
exports.ping = ping;
const ping2 = async (proxyHost, proxyPort) => {
    const command = `curl --proxy http://${proxyHost}:${proxyPort} http://www.baidu.com`;
    return new Promise((resolve) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`${proxyHost}:${proxyPort} 无法连接到代理服务器:`, error);
                resolve(false);
            }
            else if (stderr) {
                console.error(`${proxyHost}:${proxyPort}错误:`, stderr);
                resolve(false);
            }
            else {
                console.log(`${proxyHost}:${proxyPort}代理可用`, stdout);
                resolve(true);
            }
        });
    });
};
exports.ping2 = ping2;
//# sourceMappingURL=ping.js.map