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
exports.checkFileExist = checkFileExist;
exports.ensureDirectory = ensureDirectory;
exports.fileType = fileType;
exports.getIp = getIp;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
async function checkFileExist(filePath) {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
async function ensureDirectory(dirPath) {
    await fs.promises.mkdir(path.resolve(dirPath), { recursive: true });
}
function fileType(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const typeMap = {
        images: [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
        audio: [".mp3", ".wav", ".flac", ".aac", ".ogg"],
        video: [".mp4", ".avi", ".mkv", ".mov", ".webm"],
        doc: [".doc", ".docx", ".txt", ".pdf", ".xls", ".xlsx"],
    };
    for (const [type, extensions] of Object.entries(typeMap)) {
        if (extensions.includes(ext)) {
            return type;
        }
    }
    return "other";
}
function getIp() {
    const netDict = os.networkInterfaces();
    for (const devName in netDict) {
        const netList = netDict[devName];
        if (!netList)
            continue;
        for (const net of netList) {
            const { address, family, internal, mac } = net;
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal && mac && !isVmNetwork(mac)) {
                return address;
            }
        }
    }
    return undefined;
}
const VM_MAC_PREFIXES = [
    "00:05:69",
    "00:0C:29",
    "00:50:56",
    "00:1C:42",
    "00:03:FF",
    "00:0F:4B",
    "00:16:3E",
    "08:00:27",
    "00:00:00",
];
function isVmNetwork(mac) {
    return VM_MAC_PREFIXES.some((prefix) => mac.startsWith(prefix));
}
//# sourceMappingURL=fileTool.js.map