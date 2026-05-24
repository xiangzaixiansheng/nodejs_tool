import { config as defaultConfig } from "./config.default";

const env = process.env.NODE_ENV || "dev";

async function loadConfig() {
  const module = await import(`./config.${env}`);
  const envConfig = module.config || module.default;

  if (!envConfig) {
    throw new Error(`未找到该环境下的配置文件：${env}`);
  }

  return {
    ...defaultConfig,
    ...envConfig
  };
}

export async function getConfig() {
  return await loadConfig();
}

// 同步版本供兼容使用
export function getConfigSync() {
  const envConfig = require(`./config.${env}`).config || require(`./config.${env}`).default;
  return {
    ...defaultConfig,
    ...envConfig
  };
}

export default getConfigSync;