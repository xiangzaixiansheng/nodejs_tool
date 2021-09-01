
import xlsx from 'node-xlsx';
import * as fs from 'fs';

class excelTool {

    public parseXlsxFile(path: string): string[][] {
        if (!path) {
            throw new Error('文件路径不存在');
        }

        const [result] = xlsx.parse(fs.readFileSync(path));
        fs.unlink(path, (err) => {
            if (err) {
                console.log('[parseXlsxFile]: 文件删除失败！', err.message || err);
            }
        });

        return result.data as string[][];
    }

    public getDataFromExcelData(data: string[][]) {
        data = data.slice();
        const fields = data.shift();
        data = data.filter((item) => !!item.length);
        if (!data.length) {
            throw new Error('数据为空');
        }
        const list: {
            [key: string]: string;
        }[] = [];

        data.forEach((item) => {
            const ret: {
                [key: string]: string;
            } = {};
            item.forEach((value, index) => {
                //@ts-ignore
                const field = fields[index];
                ret[field] = value;
            });
            list.push(ret);
        });

        return list;
    }
    
    /**
     * 生成表格
     * @param listData 数据json对象
     * @param fields 标题数据
     * @returns 
     */
    public geneExcel(
        listData: {
            [key: string]: any;
        }[],
        fields: string[]
    ) {
        const group = listData.map((item) => {
            const values: string[] = [];
            fields.forEach((field) => {

                values.push(item[field]);

            });
            return values;
        });

        return xlsx.build([
            {
                name: '默认模板',
                data: [fields, ...group]
            }
        ]);
    }

}