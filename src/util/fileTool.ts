import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * 检测文件是否存在
 * @param filePath
 * @returns
 */
export function checkFileExist(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
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

interface FileWithOriginalname {
    originalname: string;
}

export const fileType = (file: FileWithOriginalname): string => {
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


interface NetworkInfo {
    address: string;
    family: string;
    internal: boolean;
    mac?: string;
}

// 获取本机ip
export const getIp = (): string | undefined => {
    const netDict = os.networkInterfaces();
    for (const devName in netDict) {
        const netList = netDict[devName];
        if (!netList) continue;

        for (const net of netList) {
            const { address, family, internal, mac } = net as NetworkInfo;
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal && mac && !isVmNetwork(mac)) {
                return address;
            }
        }
    }
    return undefined;
}

// 增加一个判断VM虚拟机的方法
function isVmNetwork(mac: string): boolean {
    // 常见的虚拟网卡MAC地址和厂商
    const vmNetwork = [
        "00:05:69", // vmware1
        "00:0C:29", // vmware2
        "00:50:56", // vmware3
        "00:1C:42", // parallels1
        "00:03:FF", // microsoft virtual pc
        "00:0F:4B", // virtual iron 4
        "00:16:3E", // red hat xen, oracle vm, xen source, novell xen
        "08:00:27", // virtualbox
        "00:00:00", // VPN
    ];
    for (const macPrefix of vmNetwork) {
        if (mac.startsWith(macPrefix)) {
            return true;
        }
    }
    return false;
}
