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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressFolder = void 0;
const fs = __importStar(require("fs-extra"));
const zlib = __importStar(require("zlib"));
const archiver_1 = __importDefault(require("archiver"));
const compressFolder = (sourceFolderPath, outputFilePath) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputFilePath);
        const archive = (0, archiver_1.default)("zip", {
            zlib: { level: zlib.constants.Z_BEST_COMPRESSION },
        });
        output.on("close", () => {
            resolve("压缩已完成");
        });
        output.on("end", () => {
            resolve("数据写入已结束");
        });
        archive.on("warning", (warning) => {
            reject(warning);
        });
        archive.on("error", (err) => {
            reject(err);
        });
        archive.pipe(output);
        archive.directory(sourceFolderPath, false);
        archive.finalize();
    });
};
exports.compressFolder = compressFolder;
//# sourceMappingURL=zlibUtil.js.map