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
declare function request<T = unknown>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
export declare function httpGet<T = unknown>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>>;
export declare function httpPost<T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>>;
export declare function httpPut<T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>>;
export declare function httpDelete<T = unknown>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>>;
export declare function httpPatch<T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>>;
export { request as httpClient };
//# sourceMappingURL=httpClient.d.ts.map