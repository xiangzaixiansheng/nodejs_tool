import xlsx from 'node-xlsx';
import * as fs from 'fs';

export class excelTool {

    public parseXlsxFile(filePath: string): string[][] {
        if (!filePath) {
            throw new Error('文件路径不存在');
        }

        const buffer = fs.readFileSync(filePath);
        const result = xlsx.parse(buffer as unknown as ArrayBuffer);
        return result[0]?.data as string[][];
    }

    public getDataFromExcelData(data: string[][], format: Record<string, string> = {}) {
        const rows = data.slice();
        const fields = rows.shift();
        const filtered = rows.filter((item) => item.length > 0);
        if (!filtered.length) {
            throw new Error('数据为空');
        }

        return filtered.map((item) => {
            const ret: Record<string, string> = {};
            item.forEach((value, index) => {
                const originalField = fields?.[index] ?? '';
                const field = format[originalField] || originalField;
                ret[field] = value;
            });
            return ret;
        });
    }

    public geneExcel(
        listData: Record<string, unknown>[],
        fields: string[]
    ) {
        const group = listData.map((item) => {
            return fields.map((field) => String(item[field] ?? ''));
        });

        return xlsx.build([
            {
                name: '模板',
                data: [fields, ...group],
                options: {}
            }
        ]);
    }
}
