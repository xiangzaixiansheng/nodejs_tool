"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpGet = httpGet;
exports.httpPost = httpPost;
exports.httpPut = httpPut;
exports.httpDelete = httpDelete;
exports.httpPatch = httpPatch;
exports.httpClient = request;
const logger_1 = require("./logger");
const DEFAULT_TIMEOUT = 30000;
function buildUrl(url, params) {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${searchParams.toString()}`;
}
async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
async function request(url, config = {}) {
    const { method = 'GET', headers = {}, params, body, timeout = DEFAULT_TIMEOUT } = config;
    const fullUrl = buildUrl(url, params);
    logger_1.logger.debug(`HTTP Request: ${method} ${fullUrl}`);
    try {
        const response = await fetchWithTimeout(fullUrl, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        }, timeout);
        logger_1.logger.debug(`HTTP Response: ${response.status} ${fullUrl}`);
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            return {
                success: false,
                error: errorText || `HTTP ${response.status}`,
                statusCode: response.status,
            };
        }
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType?.includes('application/json')) {
            data = await response.json();
        }
        else {
            data = await response.text();
        }
        return {
            success: true,
            data,
            statusCode: response.status,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (error instanceof Error && error.name === 'AbortError') {
            logger_1.logger.error('HTTP Request Timeout:', { url, method });
            return {
                success: false,
                error: '请求超时',
                statusCode: -1,
            };
        }
        logger_1.logger.error('HTTP Request Error:', { error: errorMessage, url, method });
        return {
            success: false,
            error: errorMessage,
            statusCode: -1,
        };
    }
}
async function httpGet(url, config) {
    return request(url, { ...config, method: 'GET' });
}
async function httpPost(url, body, config) {
    return request(url, { ...config, method: 'POST', body });
}
async function httpPut(url, body, config) {
    return request(url, { ...config, method: 'PUT', body });
}
async function httpDelete(url, config) {
    return request(url, { ...config, method: 'DELETE' });
}
async function httpPatch(url, body, config) {
    return request(url, { ...config, method: 'PATCH', body });
}
//# sourceMappingURL=httpClient.js.map