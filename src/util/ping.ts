const axios = require('axios');
const { exec } = require('child_process');

export const ping = async (proxyHost: string, proxyPort: string) => {
	try {
		const response = await axios.get('https://www.baidu.com/', {
			proxy: {
				host: proxyHost,
				port: proxyPort,
			},
			timeout: 5000, // 设置超时时间，单位毫秒
		});

		if (response.status === 200) {
			console.log(`代理 ${proxyHost}:${proxyPort} 可用`);
			return true;
		} else {
			console.log(`代理 ${proxyHost}:${proxyPort} 响应异常，状态码：${response.status}`);
			return false;
		}
	} catch (error) {
		console.log(`代理 ${proxyHost}:${proxyPort} 不可用，错误信息：${error}`);
		return false;
	}
};

export const ping2 = async (proxyHost: string, proxyPort: string) => {
	const command = `curl --proxy http://${proxyHost}:${proxyPort} http://www.baidu.com`;
	return new Promise((resolve, reject) => {
		exec(command, (error: any, stdout: any, stderr: any) => {
			if (error) {
				console.error(`${proxyHost}:${proxyPort} 无法连接到代理服务器:`, error);
				return false;
			} else if (stderr) {
				console.error(`${proxyHost}:${proxyPort}错误:`, stderr);
				return false;
			} else {
				console.log(`${proxyHost}:${proxyPort}代理可用`, stdout);
				return true;
			}
		});
	});
};
