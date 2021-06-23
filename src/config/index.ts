const env = process.env.NODE_ENV || "dev";
const config = require(`./config.${env}`).default;

if (!config) {
  throw new Error(`未找到该环境下的配置文件：${env}`);
}

export default () => {
  return {
    ...config
  }
}