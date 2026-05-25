export declare class excelTool {
    parseXlsxFile(filePath: string): string[][];
    getDataFromExcelData(data: string[][], format?: Record<string, string>): Record<string, string>[];
    geneExcel(listData: Record<string, unknown>[], fields: string[]): ArrayBuffer;
}
//# sourceMappingURL=excelTool.d.ts.map