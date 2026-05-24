import { logger } from './logger';

/**
 * 统一的 HTTP 客户端
 * 使用 Node.js 内置 fetch API (Node.js 18+)
 * 替代 axios 和旧的 requestTool.ts
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30000;

/**
 * 构建 URL（处理 query 参数）
 */
function buildUrl(url: string, params?: Record<string, string | number | boolean>): string {
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

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 统一的 HTTP 请求方法
 */
async function request<T = unknown>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, params, body, timeout = DEFAULT_TIMEOUT } = config;

  const fullUrl = buildUrl(url, params);

  logger.debug(`HTTP Request: ${method} ${fullUrl}`);

  try {
    const response = await fetchWithTimeout(
      fullUrl,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      timeout
    );

    logger.debug(`HTTP Response: ${response.status} ${fullUrl}`);

    // 处理非 2xx 响应
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: errorText || `HTTP ${response.status}`,
        statusCode: response.status,
      };
    }

    // 解析响应体
    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType?.includes('application/json')) {
      data = await response.json() as T;
    } else {
      data = await response.text() as unknown as T;
    }

    return {
      success: true,
      data,
      statusCode: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // 区分超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('HTTP Request Timeout:', { url, method });
      return {
        success: false,
        error: '请求超时',
        statusCode: -1,
      };
    }

    logger.error('HTTP Request Error:', { error: errorMessage, url, method });
    return {
      success: false,
      error: errorMessage,
      statusCode: -1,
    };
  }
}

/**
 * GET 请求
 */
export async function httpGet<T = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'method' | 'body'>,
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'GET' });
}

/**
 * POST 请求
 */
export async function httpPost<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>,
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'POST', body });
}

/**
 * PUT 请求
 */
export async function httpPut<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>,
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'PUT', body });
}

/**
 * DELETE 请求
 */
export async function httpDelete<T = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'method'>,
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'DELETE' });
}

/**
 * PATCH 请求
 */
export async function httpPatch<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>,
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'PATCH', body });
}

// 兼容旧代码的默认导出
export { request as httpClient };
