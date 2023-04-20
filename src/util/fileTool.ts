
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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


//获取本机ip
export const getIp = () => {
    let netDict = os.networkInterfaces();
    for (const devName in netDict) {
        let netList = netDict[devName];
        //@ts-ignore
        for (var i = 0; i < netList.length; i++) {
            //@ts-ignore
            let { address, family, internal, mac } = netList[i];
            let isvm = isVmNetwork(mac)
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal && !isVmNetwork(mac)) {
                return address;
            }
        }
    }
}

// 增加一个判断VM虚拟机的方法  
// 在上面方法的if中加上这个方法的返回判断就行了
function isVmNetwork(mac: string): boolean {
    // 常见的虚拟网卡MAC地址和厂商
    let vmNetwork = [
        "00:05:69", //vmware1
        "00:0C:29", //vmware2
        "00:50:56", //vmware3
        "00:1C:42", //parallels1
        "00:03:FF", //microsoft virtual pc
        "00:0F:4B", //virtual iron 4
        "00:16:3E", //red hat xen , oracle vm , xen source, novell xen
        "08:00:27", //virtualbox
        "00:00:00", // VPN
    ]
    for (let i = 0; i < vmNetwork.length; i++) {
        let mac_per = vmNetwork[i];
        if (mac.startsWith(mac_per)) {
            return true
        }
    }
    return false;
}

