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
exports.profiler = void 0;
const v8Profiler = require('v8-profiler-next');
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fsExtra = __importStar(require("fs-extra"));
class profiler {
    constructor() {
        this.title = 'example';
        this.time = 30 * 1000;
    }
    async start() {
        v8Profiler.startProfiling(this.title, true);
        let _p = path.resolve(__dirname, "./cpu_profiler");
        let isExist = await this.checkFileExist(_p);
        !isExist && fsExtra.ensureDirSync(_p);
        setTimeout(() => {
            const profile = v8Profiler.stopProfiling(this.title);
            profile.export((error, result) => {
                fs.writeFileSync(`${_p}/${this.title}.cpuprofile`, result);
                profile.delete();
            });
        }, this.time);
    }
    checkFileExist(filePath) {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }
}
exports.profiler = profiler;
