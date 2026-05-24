import { Context } from "koa";
export declare class ApiController {
    private readonly service;
    constructor();
    testRedis(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    }>;
    testArray(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    }>;
    testRequestV1(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    }>;
    uploadFile(ctx: Context): Promise<void>;
    uploadFileByStream(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    }>;
    download(ctx: Context): Promise<void>;
}
export default ApiController;
//# sourceMappingURL=api.d.ts.map