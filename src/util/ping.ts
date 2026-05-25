import { exec } from 'child_process';
import { logger } from './logger';

export const ping = async (_proxyHost: string, _proxyPort: string): Promise<boolean> => {
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
		} else {
			logger.warn(`Network response abnormal, status: ${response.status}`);
			return false;
		}
	} catch (error) {
		logger.error('Network unavailable:', error);
		return false;
	}
};

export const ping2 = async (proxyHost: string, proxyPort: string): Promise<boolean> => {
	const command = `curl --proxy http://${proxyHost}:${proxyPort} http://www.baidu.com`;
	return new Promise((resolve) => {
		exec(command, (error, _stdout, stderr) => {
			if (error) {
				logger.error(`${proxyHost}:${proxyPort} proxy connection failed:`, error);
				resolve(false);
			} else if (stderr) {
				logger.error(`${proxyHost}:${proxyPort} proxy error:`, stderr);
				resolve(false);
			} else {
				logger.info(`${proxyHost}:${proxyPort} proxy available`);
				resolve(true);
			}
		});
	});
};
