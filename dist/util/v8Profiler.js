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
exports.profiler = void 0;
const v8Profiler = require('v8-profiler-next');
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fsExtra = __importStar(require("fs-extra"));
class profiler {
    title = 'example';
    time = 30 * 1000;
    async start() {
        v8Profiler.startProfiling(this.title, true);
        let _p = path.resolve(__dirname, "./cpu_profiler");
        let isExist = await this.checkFileExist(_p);
        !isExist && fsExtra.ensureDirSync(_p);
        setTimeout(() => {
            const profile = v8Profiler.stopProfiling(this.title);
            profile.export((_error, result) => {
                fs.writeFileSync(`${_p}/${this.title}.cpuprofile`, result);
                profile.delete();
            });
        }, this.time);
    }
    checkFileExist(filePath) {
        return new Promise((resolve) => {
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
//# sourceMappingURL=v8Profiler.js.map