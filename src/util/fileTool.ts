
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

export const fileType = (file: any) => {
    const typeList = file.originalname.split('.');
    const type = typeList.length ? typeList[typeList.length - 1] : ''
    let dir: string;
    if (/\.(png|jpe?g|gif|svg)(\?\S*)?$/.test(file.originalname)) {
        dir = 'images';
    } else if (/\.(mp3)(\?\S*)?$/.test(file.originalname)) {
        dir = 'audio';
    } else if (/\.mp4|avi/.test(file.originalname)) {
        dir = 'video';
    } else if (/\.(doc|txt)(\?\S*)?$/.test(file.originalname)) {
        dir = 'doc';
    } else {
        dir = 'other';
    }
    return dir;
};
