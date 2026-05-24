"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpClient = void 0;
exports.httpGet = httpGet;
exports.httpPost = httpPost;
exports.httpPut = httpPut;
exports.httpDelete = httpDelete;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const httpClient = axios_1.default.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
exports.httpClient = httpClient;
httpClient.interceptors.request.use((config) => {
    logger_1.logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error) => {
    logger_1.logger.error('HTTP Request Error:', error);
    return Promise.reject(error);
});
httpClient.interceptors.response.use((response) => {
    logger_1.logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
    return response;
}, (error) => {
    if (error.response) {
        logger_1.logger.error('HTTP Response Error:', {
            status: error.response.status,
            url: error.config?.url,
            data: error.response.data,
        });
    }
    else if (error.request) {
        logger_1.logger.error('HTTP No Response:', error.message);
    }
    else {
        logger_1.logger.error('HTTP Error:', error.message);
    }
    return Promise.reject(error);
});
async function httpGet(url, config, logEnabled = false) {
    try {
        const response = await httpClient.get(url, config);
        if (logEnabled) {
            logger_1.logger.debug({ data: response.data, url, method: 'GET' });
        }
        return {
            success: true,
            data: response.data,
            statusCode: response.status,
        };
    }
    catch (err) {
        return {
            success: false,
            error: err?.response?.data?.message || err.message,
            statusCode: err?.response?.status || -1,
        };
    }
}
async function httpPost(url, data, config, logEnabled = false) {
    try {
        const response = await httpClient.post(url, data, config);
        if (logEnabled) {
            logger_1.logger.debug({ data: response.data, url, method: 'POST' });
        }
        return {
            success: true,
            data: response.data,
            statusCode: response.status,
        };
    }
    catch (err) {
        return {
            success: false,
            error: err?.response?.data?.message || err.message,
            statusCode: err?.response?.status || -1,
        };
    }
}
async function httpPut(url, data, config) {
    try {
        const response = await httpClient.put(url, data, config);
        return {
            success: true,
            data: response.data,
            statusCode: response.status,
        };
    }
    catch (err) {
        return {
            success: false,
            error: err?.response?.data?.message || err.message,
            statusCode: err?.response?.status || -1,
        };
    }
}
async function httpDelete(url, config) {
    try {
        const response = await httpClient.delete(url, config);
        return {
            success: true,
            data: response.data,
            statusCode: response.status,
        };
    }
    catch (err) {
        return {
            success: false,
            error: err?.response?.data?.message || err.message,
            statusCode: err?.response?.status || -1,
        };
    }
}
//# sourceMappingURL=httpClient.js.map