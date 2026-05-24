import { AxiosRequestConfig, AxiosInstance } from 'axios';
declare const axiosInstance: AxiosInstance;
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
}
export declare function axiosGet<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
export declare function axiosPost<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
export declare function axiosPut<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
export declare function axiosDelete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
export declare function uploadWithProgress(url: string, formData: FormData, onProgress: (percent: number) => void): Promise<ApiResponse<unknown>>;
export declare function createCancelableRequest<T>(): {
    request: (url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>;
    cancel: () => void;
};
export { axiosInstance as axiosClient };
//# sourceMappingURL=httpClientAxios.d.ts.map