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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const redisTool_1 = require("../util/redisTool");
const arrayTool_1 = require("../util/arrayTool");
const httpClient_1 = require("../util/httpClient");
const logger_1 = require("../util/logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fse = __importStar(require("fs-extra"));
class ApiService {
    async testRedis() {
        await redisTool_1.redis_tool.setString("test", { hello: "hello" });
        await redisTool_1.redis_tool.hset("testJson", "userName", "haha");
        const res = await redisTool_1.redis_tool.scan("*", 100);
        return res;
    }
    async testArray(query) {
        if (query?.array) {
            return (0, arrayTool_1.sortBy)(String(query.array).split(","));
        }
        const testArray = [8, 9, 2, 1, 0, 6];
        const result1 = (0, arrayTool_1.sortBy)(testArray);
        const result2 = (0, arrayTool_1.sortBy)(testArray, (item) => -item);
        const chunk = (0, arrayTool_1.arrayChunk)(testArray, 3);
        logger_1.logger.info({ result1, result2, chunk }, 'Array test results');
        return {
            sorted: result1,
            sortedDesc: result2,
            chunked: chunk,
        };
    }
    async testRequestV1() {
        const res = await (0, httpClient_1.httpGet)("http://localhost:8080/api/testArray", { params: { array: "8,9,2,1,3,4", data: "123" } });
        return res;
    }
    async uploadFileByStream(ctx) {
        const file = ctx.request.file;
        const files = ctx.request.files;
        if (!file && !files) {
            throw new Error('未找到上传的文件');
        }
        const uploadedFile = file || files?.file;
        if (!uploadedFile) {
            throw new Error('文件上传失败');
        }
        logger_1.logger.info({
            filename: uploadedFile.originalname,
            size: uploadedFile.size,
        }, 'File uploaded');
        const filePath = path.join(__dirname, '../uploads/stream');
        const targetPath = path.join(filePath, uploadedFile.originalname || 'unnamed');
        if (!fs.existsSync(filePath)) {
            await fs.promises.mkdir(filePath, { recursive: true });
        }
        await fse.copy(uploadedFile.path, targetPath);
        await fse.remove(uploadedFile.path);
        return {
            filename: uploadedFile.originalname,
            size: uploadedFile.size,
            path: targetPath,
        };
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=ApiService.js.map