import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { logger } from './logger';

/**
 * 统一的 HTTP 客户端
 * 替代 requestTool.ts 和 reqPromiseTool.ts
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

const httpClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('HTTP Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      logger.error('HTTP Response Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      logger.error('HTTP No Response:', error.message);
    } else {
      logger.error('HTTP Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * GET 请求
 */
export async function httpGet<T = any>(
  url: string,
  config?: AxiosRequestConfig,
  logEnabled = false
): Promise<ApiResponse<T>> {
  try {
    const response = await httpClient.get<T>(url, config);
    if (logEnabled) {
      logger.debug({ data: response.data, url, method: 'GET' });
    }
    return {
      success: true,
      data: response.data,
      statusCode: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
      statusCode: err?.response?.status || -1,
    };
  }
}

/**
 * POST 请求
 */
export async function httpPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  logEnabled = false
): Promise<ApiResponse<T>> {
  try {
    const response = await httpClient.post<T>(url, data, config);
    if (logEnabled) {
      logger.debug({ data: response.data, url, method: 'POST' });
    }
    return {
      success: true,
      data: response.data,
      statusCode: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
      statusCode: err?.response?.status || -1,
    };
  }
}

/**
 * PUT 请求
 */
export async function httpPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await httpClient.put<T>(url, data, config);
    return {
      success: true,
      data: response.data,
      statusCode: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
      statusCode: err?.response?.status || -1,
    };
  }
}

/**
 * DELETE 请求
 */
export async function httpDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await httpClient.delete<T>(url, config);
    return {
      success: true,
      data: response.data,
      statusCode: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
      statusCode: err?.response?.status || -1,
    };
  }
}

export { httpClient };
