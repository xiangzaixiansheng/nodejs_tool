import { exec } from 'child_process';

/**
 * 通过 HTTP 请求测试代理可用性
 * 注意：Node.js 内置 fetch 需要额外的代理配置，这里使用直接连接测试
 */
export const ping = async (_proxyHost: string, _proxyPort: string): Promise<boolean> => {
	try {
		// 使用 HEAD 请求减少数据传输
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
		} else {
			console.log(`网络响应异常，状态码：${response.status}`);
			return false;
		}
	} catch (error) {
		console.log(`网络不可用，错误信息：${error}`);
		return false;
	}
};

/**
 * 使用 curl 命令测试代理
 */
export const ping2 = async (proxyHost: string, proxyPort: string): Promise<boolean> => {
	const command = `curl --proxy http://${proxyHost}:${proxyPort} http://www.baidu.com`;
	return new Promise((resolve) => {
		exec(command, (error: any, _stdout: any, stderr: any) => {
			if (error) {
				console.error(`${proxyHost}:${proxyPort} 无法连接到代理服务器:`, error);
				resolve(false);
			} else if (stderr) {
				console.error(`${proxyHost}:${proxyPort}错误:`, stderr);
				resolve(false);
			} else {
				console.log(`${proxyHost}:${proxyPort}代理可用`);
				resolve(true);
			}
		});
	});
};
