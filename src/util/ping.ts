import { execFile } from 'child_process';
import { logger } from './logger';

/**
 * 检测网络连通性（直连）
 */
export async function ping(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('https://www.baidu.com/', {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            logger.info('Network connection available');
            return true;
        }

        logger.warn(`Network response abnormal, status: ${response.status}`);
        return false;
    } catch (error) {
        logger.error('Network unavailable:', error);
        return false;
    }
}

/**
 * 通过代理检测网络连通性
 */
export async function pingViaProxy(proxyHost: string, proxyPort: string): Promise<boolean> {
    if (!/^[\w.-]+$/.test(proxyHost) || !/^\d{1,5}$/.test(proxyPort)) {
        logger.error('Invalid proxy host or port');
        return false;
    }

    return new Promise((resolve) => {
        execFile(
            'curl',
            ['--proxy', `http://${proxyHost}:${proxyPort}`, '--max-time', '10', '-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://www.baidu.com'],
            (error, stdout, stderr) => {
                if (error) {
                    logger.error(`${proxyHost}:${proxyPort} proxy connection failed:`, error);
                    resolve(false);
                } else if (stderr) {
                    logger.error(`${proxyHost}:${proxyPort} proxy error:`, stderr);
                    resolve(false);
                } else {
                    logger.info(`${proxyHost}:${proxyPort} proxy available (HTTP ${stdout})`);
                    resolve(true);
                }
            }
        );
    });
}
