import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * 检测文件是否存在
 */
export async function checkFileExist(filePath: string): Promise<boolean> {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * 确保目录存在，不存在则创建
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
    await fs.promises.mkdir(path.resolve(dirPath), { recursive: true });
}

interface FileWithOriginalname {
    originalname: string;
}

/**
 * 根据文件扩展名判断文件类型分类
 */
export function fileType(file: FileWithOriginalname): string {
    const ext = path.extname(file.originalname).toLowerCase();

    const typeMap: Record<string, string[]> = {
        images: [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
        audio: [".mp3", ".wav", ".flac", ".aac", ".ogg"],
        video: [".mp4", ".avi", ".mkv", ".mov", ".webm"],
        doc: [".doc", ".docx", ".txt", ".pdf", ".xls", ".xlsx"],
    };

    for (const [type, extensions] of Object.entries(typeMap)) {
        if (extensions.includes(ext)) {
            return type;
        }
    }
    return "other";
}

interface NetworkInfo {
    address: string;
    family: string;
    internal: boolean;
    mac?: string;
}

/**
 * 获取本机 IP（排除虚拟机网卡）
 */
export function getIp(): string | undefined {
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

const VM_MAC_PREFIXES = [
    "00:05:69", // vmware1
    "00:0C:29", // vmware2
    "00:50:56", // vmware3
    "00:1C:42", // parallels1
    "00:03:FF", // microsoft virtual pc
    "00:0F:4B", // virtual iron 4
    "00:16:3E", // red hat xen, oracle vm
    "08:00:27", // virtualbox
    "00:00:00", // VPN
];

function isVmNetwork(mac: string): boolean {
    return VM_MAC_PREFIXES.some((prefix) => mac.startsWith(prefix));
}
