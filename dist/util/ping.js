"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping2 = exports.ping = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
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
            logger_1.logger.info('Network connection available');
            return true;
        }
        else {
            logger_1.logger.warn(`Network response abnormal, status: ${response.status}`);
            return false;
        }
    }
    catch (error) {
        logger_1.logger.error('Network unavailable:', error);
        return false;
    }
};
exports.ping = ping;
const ping2 = async (proxyHost, proxyPort) => {
    const command = `curl --proxy http://${proxyHost}:${proxyPort} http://www.baidu.com`;
    return new Promise((resolve) => {
        (0, child_process_1.exec)(command, (error, _stdout, stderr) => {
            if (error) {
                logger_1.logger.error(`${proxyHost}:${proxyPort} proxy connection failed:`, error);
                resolve(false);
            }
            else if (stderr) {
                logger_1.logger.error(`${proxyHost}:${proxyPort} proxy error:`, stderr);
                resolve(false);
            }
            else {
                logger_1.logger.info(`${proxyHost}:${proxyPort} proxy available`);
                resolve(true);
            }
        });
    });
};
exports.ping2 = ping2;
//# sourceMappingURL=ping.js.map