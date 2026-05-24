import { AxiosRequestConfig } from 'axios';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
}
declare const httpClient: import("axios").AxiosInstance;
export declare function httpGet<T = any>(url: string, config?: AxiosRequestConfig, logEnabled?: boolean): Promise<ApiResponse<T>>;
export declare function httpPost<T = any>(url: string, data?: any, config?: AxiosRequestConfig, logEnabled?: boolean): Promise<ApiResponse<T>>;
export declare function httpPut<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
export declare function httpDelete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
export { httpClient };
//# sourceMappingURL=httpClient.d.ts.map