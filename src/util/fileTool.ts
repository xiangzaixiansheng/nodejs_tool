
import * as fs from 'fs';
import * as path from 'path';

/**
 * 检测文件是否存在
 * @param filePath 
 * @returns 
 */
export function checkFileExist(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err: any) => {
            if (err) {
                return resolve(false);
            }
            return resolve(true);
        });
    });
}


export const exitsFolder = async function (reaPath: string) {
    const absPath = path.resolve(__dirname, reaPath);
    try {
        await fs.promises.stat(absPath)
    } catch (e) {
        // 不存在文件夹，直接创建 {recursive: true} 这个配置项是配置自动创建多个文件夹
        await fs.promises.mkdir(absPath, { recursive: true })
    }
}
