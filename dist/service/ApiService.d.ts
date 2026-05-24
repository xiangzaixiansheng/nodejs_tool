import { Context } from "koa";
import { PaginationInput } from '../schemas';
export declare class ApiService {
    testRedis(): Promise<string[]>;
    testArray(query?: PaginationInput): Promise<string[] | {
        sorted: number[];
        sortedDesc: number[];
        chunked: number[][];
    }>;
    testRequestV1(): Promise<import("../util/httpClient").ApiResponse<unknown>>;
    uploadFileByStream(ctx: Context): Promise<{
        filename: any;
        size: any;
        path: string;
    }>;
}
//# sourceMappingURL=ApiService.d.ts.map