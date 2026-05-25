import { Context } from "koa";
export declare class UploadController {
    initUpload(ctx: Context): Promise<void>;
    uploadChunk(ctx: Context): Promise<void>;
    mergeChunks(ctx: Context): Promise<void>;
    getStatus(ctx: Context): Promise<void>;
    getFileList(ctx: Context): Promise<void>;
}
export default UploadController;
//# sourceMappingURL=upload.d.ts.map