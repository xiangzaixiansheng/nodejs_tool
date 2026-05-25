"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = ping;
exports.pingViaProxy = pingViaProxy;
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
async function ping() {
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
        logger_1.logger.warn(`Network response abnormal, status: ${response.status}`);
        return false;
    }
    catch (error) {
        logger_1.logger.error('Network unavailable:', error);
        return false;
    }
}
async function pingViaProxy(proxyHost, proxyPort) {
    if (!/^[\w.-]+$/.test(proxyHost) || !/^\d{1,5}$/.test(proxyPort)) {
        logger_1.logger.error('Invalid proxy host or port');
        return false;
    }
    return new Promise((resolve) => {
        (0, child_process_1.execFile)('curl', ['--proxy', `http://${proxyHost}:${proxyPort}`, '--max-time', '10', '-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://www.baidu.com'], (error, stdout, stderr) => {
            if (error) {
                logger_1.logger.error(`${proxyHost}:${proxyPort} proxy connection failed:`, error);
                resolve(false);
            }
            else if (stderr) {
                logger_1.logger.error(`${proxyHost}:${proxyPort} proxy error:`, stderr);
                resolve(false);
            }
            else {
                logger_1.logger.info(`${proxyHost}:${proxyPort} proxy available (HTTP ${stdout})`);
                resolve(true);
            }
        });
    });
}
//# sourceMappingURL=ping.js.map