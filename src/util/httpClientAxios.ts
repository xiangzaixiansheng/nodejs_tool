import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';
import { logger } from './logger';

/**
 * Axios HTTP 客户端示例
 *
 * 虽然 Node.js 18+ 已内置 fetch，但 axios 在企业级项目中仍非常常用，优势包括：
 * 1. 自动 JSON 转换
 * 2. 请求/响应拦截器
 * 3. 请求取消功能
 * 4. 更友好的错误处理
 * 5. 支持请求进度监控
 * 6. 更好的 TypeScript 支持
 *
 * 本文件展示企业级 axios 封装的最佳实践
 */

// ==================== 基础配置 ====================

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== 拦截器 ====================

// 请求拦截器 - 添加认证 token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = process.env.API_TOKEN; // 实际从缓存/存储中获取
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求时间戳（用于日志）
    config.headers['X-Request-Time'] = Date.now().toString();

    logger.debug(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('[Axios] Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestTime = parseInt(response.config.headers['X-Request-Time'] as string || '0');
    const duration = Date.now() - requestTime;

    logger.debug(`[Axios] ${response.status} ${response.config.url} (${duration}ms)`);
    return response;
  },
  (error: AxiosError) => {
    handleAxiosError(error);
    return Promise.reject(error);
  }
);

// ==================== 错误处理 ====================

function handleAxiosError(error: AxiosError): void {
  if (error.response) {
    // 服务器返回错误状态码
    const { status, data } = error.response;
    logger.error(`[Axios] Response Error ${status}:`, {
      url: error.config?.url,
      method: error.config?.method,
      data,
    });

    // 根据状态码处理不同错误
    switch (status) {
      case 401:
        // 未授权，跳转到登录页
        console.error('登录已过期，请重新登录');
        break;
      case 403:
        console.error('没有权限执行此操作');
        break;
      case 404:
        console.error('请求的资源不存在');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应
    logger.error('[Axios] No Response:', error.message);
  } else {
    // 请求配置出错
    logger.error('[Axios] Config Error:', error.message);
  }
}

// ==================== 统一的响应类型 ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// ==================== HTTP 方法封装 ====================

/**
 * GET 请求
 */
export async function axiosGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.get<T>(url, config);
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
export async function axiosPost<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.post<T>(url, data, config);
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
export async function axiosPut<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.put<T>(url, data, config);
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
export async function axiosDelete<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.delete<T>(url, config);
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

// ==================== 高级功能 ====================

/**
 * 带进度监控的文件上传
 */
export async function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<ApiResponse<unknown>> {
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
      statusCode: err?.response?.status || -1,
    };
  }
}

/**
 * 可取消的请求示例
 */
export function createCancelableRequest<T>() {
  const controller = new AbortController();

  const request = async (url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get<T>(url, {
        ...config,
        signal: controller.signal as any, // axios 支持 AbortController
      });
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (err: any) {
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

// ==================== 导出实例 ====================

export { axiosInstance as axiosClient };

/**
 * 使用示例：
 *
 * ```typescript
 * import { axiosGet, axiosPost, uploadWithProgress, createCancelableRequest } from './util/httpClientAxios';
 *
 * // 简单 GET
 * const { data } = await axiosGet('/api/users');
 *
 * // POST 带参数
 * const result = await axiosPost('/api/login', { email: 'test@test.com', password: '123456' });
 *
 * // 上传文件带进度
 * const formData = new FormData();
 * formData.append('file', file);
 * const uploadResult = await uploadWithProgress('/api/upload', formData, (percent) => {
 *   console.log(`上传进度: ${percent}%`);
 * });
 *
 * // 可取消的请求
 * const { request, cancel } = createCancelableRequest();
 * setTimeout(() => cancel(), 5000); // 5秒后取消
 * const response = await request('/api/slow-endpoint');
 * ```
 */
