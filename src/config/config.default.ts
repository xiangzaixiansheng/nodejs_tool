/**
 * 默认配置 - 从环境变量读取敏感信息
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

export const config = {
  port: getEnvNumber('PORT', 3000),
  redis: {
    port: getEnvNumber('REDIS_PORT', 6379),
    host: getEnvVar('REDIS_HOST', '127.0.0.1'),
    db: getEnvNumber('REDIS_DB', 0),
  },
  bullconfig: {
    queue1: "queue1",
    queue2: "queue2"
  },
  mysql: {
    type: "mysql" as const,
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 3306),
    username: getEnvVar('DB_USERNAME', 'root'),
    password: getEnvVar('DB_PASSWORD'),
    database: getEnvVar('DB_DATABASE', 'sqlstudy'),
    synchronize: process.env.NODE_ENV === 'dev', // 是否进行数据库同步 线上环境必须为false
    logging: process.env.NODE_ENV === 'dev',
    timezone: "+8:00",
    entities:
      process.env.NODE_ENV === "dev" ? ["src/entities/*"] : ["dist/entities/*"],
  }
};

export default config;
