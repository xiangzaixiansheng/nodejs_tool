"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIp = exports.fileType = exports.exitsFolder = exports.checkFileExist = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
function checkFileExist(filePath) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return resolve(false);
            }
            return resolve(true);
        });
    });
}
exports.checkFileExist = checkFileExist;
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
    const typeList = file.originalname.split('.');
    const type = typeList.length ? typeList[typeList.length - 1] : '';
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
    let netDict = os.networkInterfaces();
    for (const devName in netDict) {
        let netList = netDict[devName];
        for (var i = 0; i < netList.length; i++) {
            let { address, family, internal, mac } = netList[i];
            let isvm = isVmNetwork(mac);
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal && !isVmNetwork(mac)) {
                return address;
            }
        }
    }
};
exports.getIp = getIp;
function isVmNetwork(mac) {
    let vmNetwork = [
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
    for (let i = 0; i < vmNetwork.length; i++) {
        let mac_per = vmNetwork[i];
        if (mac.startsWith(mac_per)) {
            return true;
        }
    }
    return false;
}
