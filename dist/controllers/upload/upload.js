"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const httpMethod_1 = require("../../util/decorator/httpMethod");
const logger_1 = require("../../util/logger");
const uploadMeta = new Map();
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
const CHUNKS_DIR = path.resolve(UPLOAD_DIR, "chunks");
const FILES_DIR = path.resolve(UPLOAD_DIR, "files");
fs.mkdirSync(CHUNKS_DIR, { recursive: true });
fs.mkdirSync(FILES_DIR, { recursive: true });
class UploadController {
    async initUpload(ctx) {
        const { filename, totalSize, chunkSize } = ctx.request.body;
        if (!filename || !totalSize || !chunkSize) {
            ctx.status = 400;
            ctx.body = { success: false, error: "缺少必要参数: filename, totalSize, chunkSize" };
            return;
        }
        const uploadId = crypto.randomUUID();
        const totalChunks = Math.ceil(totalSize / chunkSize);
        const chunkDir = path.join(CHUNKS_DIR, uploadId);
        fs.mkdirSync(chunkDir, { recursive: true });
        const meta = {
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
        logger_1.logger.info(`[Upload] Init: ${uploadId}, file: ${filename}, chunks: ${totalChunks}`);
        ctx.body = {
            success: true,
            data: { uploadId, totalChunks, chunkSize },
        };
    }
    async uploadChunk(ctx) {
        const file = ctx.file;
        const body = ctx.request.body || {};
        const uploadId = body.uploadId;
        const chunkIndex = body.chunkIndex;
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
        logger_1.logger.debug(`[Upload] Chunk ${index}/${meta.totalChunks - 1} for ${uploadId}`);
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
    async mergeChunks(ctx) {
        const { uploadId } = ctx.request.body;
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
            await new Promise((resolve, reject) => {
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
                writeStream.end();
            });
            const chunkDir = path.join(CHUNKS_DIR, uploadId);
            fs.rmSync(chunkDir, { recursive: true, force: true });
            meta.status = "done";
            meta.filePath = `/uploads/files/${finalName}`;
            logger_1.logger.info(`[Upload] Merged: ${uploadId} -> ${finalName}`);
            ctx.body = {
                success: true,
                data: {
                    uploadId,
                    filename: meta.filename,
                    size: meta.totalSize,
                    path: meta.filePath,
                },
            };
        }
        catch (error) {
            meta.status = "error";
            logger_1.logger.error("[Upload] Merge failed:", error);
            ctx.status = 500;
            ctx.body = { success: false, error: "合并分片失败" };
        }
    }
    async getStatus(ctx) {
        const uploadId = ctx.query.uploadId;
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
    async getFileList(ctx) {
        const files = [];
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
exports.UploadController = UploadController;
__decorate([
    (0, httpMethod_1.post)("/init"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "initUpload", null);
__decorate([
    (0, httpMethod_1.post)("/merge"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "mergeChunks", null);
__decorate([
    (0, httpMethod_1.get)("/status"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getStatus", null);
__decorate([
    (0, httpMethod_1.get)("/list"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getFileList", null);
exports.default = UploadController;
//# sourceMappingURL=upload.js.map