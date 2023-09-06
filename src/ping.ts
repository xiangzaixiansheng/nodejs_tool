const axios = require('axios');

export const ping = async (proxyHost: string, proxyPort: string) => {
  try {
    const response = await axios.get('https://www.baidu.com/', {
      proxy: {
        host: proxyHost,
        port: proxyPort
      },
      timeout: 5000  // 设置超时时间，单位毫秒
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
}