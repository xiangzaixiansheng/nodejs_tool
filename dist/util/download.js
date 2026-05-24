"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFileFromUrl = downloadFileFromUrl;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
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
        const response = await axios_1.default.get(fileUrl, { responseType: 'stream' });
        const filePath = path_1.default.join(targetDirectory, fileName);
        const writer = fs_1.default.createWriteStream(filePath);
        response.data.pipe(writer);
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