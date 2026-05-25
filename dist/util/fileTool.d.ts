export declare function checkFileExist(filePath: string): Promise<boolean>;
export declare function ensureDirectory(dirPath: string): Promise<void>;
interface FileWithOriginalname {
    originalname: string;
}
export declare function fileType(file: FileWithOriginalname): string;
export declare function getIp(): string | undefined;
export {};
//# sourceMappingURL=fileTool.d.ts.map