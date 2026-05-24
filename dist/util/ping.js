"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping2 = exports.ping = void 0;
const child_process_1 = require("child_process");
const ping = async (_proxyHost, _proxyPort) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch('https://www.baidu.com/', {
            method: 'HEAD',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            console.log(`网络连接可用`);
            return true;
        }
        else {
            console.log(`网络响应异常，状态码：${response.status}`);
            return false;
        }
    }
    catch (error) {
        console.log(`网络不可用，错误信息：${error}`);
        return false;
    }
};
exports.ping = ping;
const ping2 = async (proxyHost, proxyPort) => {
    const command = `curl --proxy http://${proxyHost}:${proxyPort} http://www.baidu.com`;
    return new Promise((resolve) => {
        (0, child_process_1.exec)(command, (error, _stdout, stderr) => {
            if (error) {
                console.error(`${proxyHost}:${proxyPort} 无法连接到代理服务器:`, error);
                resolve(false);
            }
            else if (stderr) {
                console.error(`${proxyHost}:${proxyPort}错误:`, stderr);
                resolve(false);
            }
            else {
                console.log(`${proxyHost}:${proxyPort}代理可用`);
                resolve(true);
            }
        });
    });
};
exports.ping2 = ping2;
//# sourceMappingURL=ping.js.map