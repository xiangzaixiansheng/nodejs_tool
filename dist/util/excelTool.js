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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelTool = void 0;
const node_xlsx_1 = __importDefault(require("node-xlsx"));
const fs = __importStar(require("fs"));
class excelTool {
    parseXlsxFile(filePath) {
        if (!filePath) {
            throw new Error('文件路径不存在');
        }
        const buffer = fs.readFileSync(filePath);
        const result = node_xlsx_1.default.parse(buffer);
        return result[0]?.data;
    }
    getDataFromExcelData(data, format = {}) {
        const rows = data.slice();
        const fields = rows.shift();
        const filtered = rows.filter((item) => item.length > 0);
        if (!filtered.length) {
            throw new Error('数据为空');
        }
        return filtered.map((item) => {
            const ret = {};
            item.forEach((value, index) => {
                const originalField = fields?.[index] ?? '';
                const field = format[originalField] || originalField;
                ret[field] = value;
            });
            return ret;
        });
    }
    geneExcel(listData, fields) {
        const group = listData.map((item) => {
            return fields.map((field) => String(item[field] ?? ''));
        });
        return node_xlsx_1.default.build([
            {
                name: '模板',
                data: [fields, ...group],
                options: {}
            }
        ]);
    }
}
exports.excelTool = excelTool;
//# sourceMappingURL=excelTool.js.map