import { Context } from "koa";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { post, get } from "../../util/decorator/httpMethod";
import { logger } from "../../util/logger";

interface ChunkMeta {
    uploadId: string;
    filename: string;
    totalSize: number;
    chunkSize: number;
    totalChunks: number;
    uploadedChunks: number[];
    createdAt: number;
    status: "uploading" | "merging" | "done" | "error";
    filePath?: string;
}

const uploadMeta: Map<string, ChunkMeta> = new Map();

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
const CHUNKS_DIR = path.resolve(UPLOAD_DIR, "chunks");
const FILES_DIR = path.resolve(UPLOAD_DIR, "files");

fs.mkdirSync(CHUNKS_DIR, { recursive: true });
fs.mkdirSync(FILES_DIR, { recursive: true });

export class UploadController {

    @post("/init")
    public async initUpload(ctx: Context) {
        const { filename, totalSize, chunkSize } = ctx.request.body as {
            filename: string;
            totalSize: number;
            chunkSize: number;
        };

        if (!filename || !totalSize || !chunkSize) {
            ctx.status = 400;
            ctx.body = { success: false, error: "缺少必要参数: filename, totalSize, chunkSize" };
            return;
        }

        const uploadId = crypto.randomUUID();
        const totalChunks = Math.ceil(totalSize / chunkSize);

        const chunkDir = path.join(CHUNKS_DIR, uploadId);
        fs.mkdirSync(chunkDir, { recursive: true });

        const meta: ChunkMeta = {
            uploadId,
            filename,
            totalSize,
            chunkSize,
            totalChunks,
            uploadedChunks: [],
            createdAt: Date.now(),
            status: "uploading",
        };

        uploadMeta.set(uploadId, meta);

        logger.info(`[Upload] Init: ${uploadId}, file: ${filename}, chunks: ${totalChunks}`);

        ctx.body = {
            success: true,
            data: { uploadId, totalChunks, chunkSize },
        };
    }

    public async uploadChunk(ctx: Context) {
        const file = (ctx as any).file;
        const body = (ctx as any).request.body || {};
        const uploadId = body.uploadId as string;
        const chunkIndex = body.chunkIndex as string;

        if (!uploadId || chunkIndex === undefined || !file) {
            ctx.status = 400;
            ctx.body = { success: false, error: "缺少必要参数: uploadId, chunkIndex, chunk file" };
            return;
        }

        const meta = uploadMeta.get(uploadId);
        if (!meta) {
            ctx.status = 404;
            ctx.body = { success: false, error: "上传任务不存在" };
            return;
        }

        const index = parseInt(chunkIndex, 10);
        if (isNaN(index) || index < 0 || index >= meta.totalChunks) {
            ctx.status = 400;
            ctx.body = { success: false, error: "无效的 chunkIndex" };
            return;
        }

        const chunkPath = path.join(CHUNKS_DIR, uploadId, `${index}`);
        fs.renameSync(file.path, chunkPath);

        if (!meta.uploadedChunks.includes(index)) {
            meta.uploadedChunks.push(index);
        }

        logger.debug(`[Upload] Chunk ${index}/${meta.totalChunks - 1} for ${uploadId}`);

        ctx.body = {
            success: true,
            data: {
                uploadId,
                chunkIndex: index,
                uploadedChunks: meta.uploadedChunks.length,
                totalChunks: meta.totalChunks,
            },
        };
    }

    @post("/merge")
    public async mergeChunks(ctx: Context) {
        const { uploadId } = ctx.request.body as { uploadId: string };

        if (!uploadId) {
            ctx.status = 400;
            ctx.body = { success: false, error: "缺少 uploadId" };
            return;
        }

        const meta = uploadMeta.get(uploadId);
        if (!meta) {
            ctx.status = 404;
            ctx.body = { success: false, error: "上传任务不存在" };
            return;
        }

        if (meta.uploadedChunks.length !== meta.totalChunks) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: `分片未完整上传 (${meta.uploadedChunks.length}/${meta.totalChunks})`,
            };
            return;
        }

        meta.status = "merging";

        try {
            const ext = path.extname(meta.filename);
            const finalName = `${uploadId}${ext}`;
            const finalPath = path.join(FILES_DIR, finalName);
            const writeStream = fs.createWriteStream(finalPath);

            for (let i = 0; i < meta.totalChunks; i++) {
                const chunkPath = path.join(CHUNKS_DIR, uploadId, `${i}`);
                const data = fs.readFileSync(chunkPath);
                writeStream.write(data);
            }

            await new Promise<void>((resolve, reject) => {
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
                writeStream.end();
            });

            const chunkDir = path.join(CHUNKS_DIR, uploadId);
            fs.rmSync(chunkDir, { recursive: true, force: true });

            meta.status = "done";
            meta.filePath = `/uploads/files/${finalName}`;

            logger.info(`[Upload] Merged: ${uploadId} -> ${finalName}`);

            ctx.body = {
                success: true,
                data: {
                    uploadId,
                    filename: meta.filename,
                    size: meta.totalSize,
                    path: meta.filePath,
                },
            };
        } catch (error) {
            meta.status = "error";
            logger.error("[Upload] Merge failed:", error);
            ctx.status = 500;
            ctx.body = { success: false, error: "合并分片失败" };
        }
    }

    @get("/status")
    public async getStatus(ctx: Context) {
        const uploadId = ctx.query.uploadId as string;

        if (!uploadId) {
            ctx.status = 400;
            ctx.body = { success: false, error: "缺少 uploadId" };
            return;
        }

        const meta = uploadMeta.get(uploadId);
        if (!meta) {
            ctx.status = 404;
            ctx.body = { success: false, error: "上传任务不存在" };
            return;
        }

        ctx.body = {
            success: true,
            data: {
                uploadId: meta.uploadId,
                filename: meta.filename,
                totalSize: meta.totalSize,
                totalChunks: meta.totalChunks,
                uploadedChunks: meta.uploadedChunks.sort((a, b) => a - b),
                status: meta.status,
                progress: Math.round((meta.uploadedChunks.length / meta.totalChunks) * 100),
            },
        };
    }

    @get("/list")
    public async getFileList(ctx: Context) {
        const files: Array<{
            uploadId: string;
            filename: string;
            size: number;
            status: string;
            createdAt: number;
            path?: string;
        }> = [];

        uploadMeta.forEach((meta) => {
            files.push({
                uploadId: meta.uploadId,
                filename: meta.filename,
                size: meta.totalSize,
                status: meta.status,
                createdAt: meta.createdAt,
                path: meta.filePath,
            });
        });

        files.sort((a, b) => b.createdAt - a.createdAt);

        ctx.body = {
            success: true,
            data: files,
        };
    }
}

export default UploadController;
