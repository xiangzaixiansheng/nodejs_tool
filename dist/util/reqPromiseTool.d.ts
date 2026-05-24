import { AxiosRequestConfig } from 'axios';
export declare const reqGetPromise: (url: string, params?: any, headers?: any) => Promise<{
    status: number;
    data: any;
    statusInfo?: undefined;
} | {
    status: number;
    data: any;
    statusInfo: string;
}>;
export declare const reqPostPromise: (url: string, data: any, headers?: any) => Promise<{
    status: number;
    data: any;
    statusInfo?: undefined;
} | {
    status: number;
    data: any;
    statusInfo: string;
}>;
export declare const reqPostPromiseV2: (options: AxiosRequestConfig) => Promise<{
    status: number;
    data: any;
    statusInfo?: undefined;
} | {
    status: number;
    data: any;
    statusInfo: string;
}>;
//# sourceMappingURL=reqPromiseTool.d.ts.map