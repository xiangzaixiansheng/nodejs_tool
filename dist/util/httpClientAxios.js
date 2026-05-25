"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosClient = void 0;
exports.axiosGet = axiosGet;
exports.axiosPost = axiosPost;
exports.axiosPut = axiosPut;
exports.axiosDelete = axiosDelete;
exports.uploadWithProgress = uploadWithProgress;
exports.createCancelableRequest = createCancelableRequest;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const axiosInstance = axios_1.default.create({
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
exports.axiosClient = axiosInstance;
axiosInstance.interceptors.request.use((config) => {
    const token = process.env.API_TOKEN;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-Time'] = Date.now().toString();
    logger_1.logger.debug(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error) => {
    logger_1.logger.error('[Axios] Request Error:', error);
    return Promise.reject(error);
});
axiosInstance.interceptors.response.use((response) => {
    const requestTime = parseInt(response.config.headers['X-Request-Time'] || '0');
    const duration = Date.now() - requestTime;
    logger_1.logger.debug(`[Axios] ${response.status} ${response.config.url} (${duration}ms)`);
    return response;
}, (error) => {
    handleAxiosError(error);
    return Promise.reject(error);
});
function handleAxiosError(error) {
    if (error.response) {
        const { status, data } = error.response;
        logger_1.logger.error(`[Axios] Response Error ${status}:`, {
            url: error.config?.url,
            method: error.config?.method,
            data,
        });
        switch (status) {
            case 401:
                logger_1.logger.warn('Axios: 登录已过期，请重新登录');
                break;
            case 403:
                logger_1.logger.warn('Axios: 没有权限执行此操作');
                break;
            case 404:
                logger_1.logger.warn('Axios: 请求的资源不存在');
                break;
            case 500:
                logger_1.logger.error('Axios: 服务器内部错误');
                break;
        }
    }
    else if (error.request) {
        logger_1.logger.error('[Axios] No Response:', error.message);
    }
    else {
        logger_1.logger.error('[Axios] Config Error:', error.message);
    }
}
async function axiosGet(url, config) {
    try {
        const response = await axiosInstance.get(url, config);
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
async function axiosPost(url, data, config) {
    try {
        const response = await axiosInstance.post(url, data, config);
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
async function axiosPut(url, data, config) {
    try {
        const response = await axiosInstance.put(url, data, config);
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
async function axiosDelete(url, config) {
    try {
        const response = await axiosInstance.delete(url, config);
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
async function uploadWithProgress(url, formData, onProgress) {
    try {
        const response = await axiosInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percent = progressEvent.total
                    ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    : 0;
                onProgress(percent);
            },
        });
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
function createCancelableRequest() {
    const controller = new AbortController();
    const request = async (url, config) => {
        try {
            const response = await axiosInstance.get(url, {
                ...config,
                signal: controller.signal,
            });
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
            };
        }
        catch (err) {
            if (err.name === 'CanceledError') {
                return {
                    success: false,
                    error: '请求已取消',
                    statusCode: -2,
                };
            }
            return {
                success: false,
                error: err?.response?.data?.message || err.message,
                statusCode: err?.response?.status || -1,
            };
        }
    };
    const cancel = () => {
        controller.abort();
    };
    return { request, cancel };
}
//# sourceMappingURL=httpClientAxios.js.map