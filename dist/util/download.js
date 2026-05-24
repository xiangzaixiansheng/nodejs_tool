"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFileFromUrl = downloadFileFromUrl;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
async function downloadFileFromUrl(fileUrl, targetDirectory, customFileName) {
    try {
        let fileName;
        if (customFileName) {
            fileName = customFileName;
        }
        else {
            const parsedUrl = new url_1.URL(fileUrl);
            const pathParts = parsedUrl.pathname.split('/');
            const potentialName = pathParts.pop() || '';
            if (potentialName.includes('.') && !potentialName.startsWith('.')) {
                fileName = potentialName;
            }
            else {
                const keyParam = parsedUrl.searchParams.get('key');
                if (keyParam) {
                    const keyParts = keyParam.split('/');
                    fileName = keyParts.pop() || 'downloaded_file';
                }
                else {
                    fileName = 'downloaded_file';
                }
            }
        }
        if (!fs_1.default.existsSync(targetDirectory)) {
            fs_1.default.mkdirSync(targetDirectory, { recursive: true });
        }
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is empty');
        }
        const filePath = path_1.default.join(targetDirectory, fileName);
        const writer = fs_1.default.createWriteStream(filePath);
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            writer.write(Buffer.from(value));
        }
        writer.end();
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(path_1.default.resolve(filePath)));
            writer.on('error', reject);
        });
    }
    catch (error) {
        throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=download.js.map