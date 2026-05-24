"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIp = exports.fileType = exports.exitsFolder = void 0;
exports.checkFileExist = checkFileExist;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
function checkFileExist(filePath) {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return resolve(false);
            }
            return resolve(true);
        });
    });
}
const exitsFolder = async function (reaPath) {
    const absPath = path.resolve(__dirname, reaPath);
    try {
        await fs.promises.stat(absPath);
    }
    catch (e) {
        await fs.promises.mkdir(absPath, { recursive: true });
    }
};
exports.exitsFolder = exitsFolder;
const fileType = (file) => {
    let dir;
    if (/\.(png|jpe?g|gif|svg)(\?\S*)?$/.test(file.originalname)) {
        dir = 'images';
    }
    else if (/\.(mp3)(\?\S*)?$/.test(file.originalname)) {
        dir = 'audio';
    }
    else if (/\.mp4|avi/.test(file.originalname)) {
        dir = 'video';
    }
    else if (/\.(doc|txt)(\?\S*)?$/.test(file.originalname)) {
        dir = 'doc';
    }
    else {
        dir = 'other';
    }
    return dir;
};
exports.fileType = fileType;
const getIp = () => {
    const netDict = os.networkInterfaces();
    for (const devName in netDict) {
        const netList = netDict[devName];
        if (!netList)
            continue;
        for (const net of netList) {
            const { address, family, internal, mac } = net;
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal && mac && !isVmNetwork(mac)) {
                return address;
            }
        }
    }
    return undefined;
};
exports.getIp = getIp;
function isVmNetwork(mac) {
    const vmNetwork = [
        "00:05:69",
        "00:0C:29",
        "00:50:56",
        "00:1C:42",
        "00:03:FF",
        "00:0F:4B",
        "00:16:3E",
        "08:00:27",
        "00:00:00",
    ];
    for (const macPrefix of vmNetwork) {
        if (mac.startsWith(macPrefix)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=fileTool.js.map