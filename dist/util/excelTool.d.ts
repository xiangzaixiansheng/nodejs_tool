export declare class excelTool {
    parseXlsxFile(path: string): string[][];
    getDataFromExcelData(data: string[][], format?: {
        [key: string]: string;
    }): {
        [key: string]: string;
    }[];
    geneExcel(listData: {
        [key: string]: any;
    }[], fields: string[]): ArrayBuffer;
}
//# sourceMappingURL=excelTool.d.ts.map