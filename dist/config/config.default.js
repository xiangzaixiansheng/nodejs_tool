"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
function getEnvVar(key, defaultValue) {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue;
}
function getEnvNumber(key, defaultValue) {
    const value = process.env[key];
    if (!value)
        return defaultValue;
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
}
exports.config = {
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
        type: "mysql",
        host: getEnvVar('DB_HOST', 'localhost'),
        port: getEnvNumber('DB_PORT', 3306),
        username: getEnvVar('DB_USERNAME', 'root'),
        password: getEnvVar('DB_PASSWORD'),
        database: getEnvVar('DB_DATABASE', 'sqlstudy'),
        synchronize: process.env.NODE_ENV === 'dev',
        logging: process.env.NODE_ENV === 'dev',
        timezone: "+8:00",
        entities: process.env.NODE_ENV === "dev" ? ["src/entities/*"] : ["dist/entities/*"],
    }
};
exports.default = exports.config;
//# sourceMappingURL=config.default.js.map