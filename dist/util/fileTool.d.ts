export declare function checkFileExist(filePath: string): Promise<boolean>;
export declare const exitsFolder: (reaPath: string) => Promise<void>;
interface FileWithOriginalname {
    originalname: string;
}
export declare const fileType: (file: FileWithOriginalname) => string;
export declare const getIp: () => string | undefined;
export {};
//# sourceMappingURL=fileTool.d.ts.map