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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelTool = void 0;
const node_xlsx_1 = __importDefault(require("node-xlsx"));
const fs = __importStar(require("fs"));
class excelTool {
    parseXlsxFile(path) {
        if (!path) {
            throw new Error('文件路径不存在');
        }
        const [result] = node_xlsx_1.default.parse(fs.readFileSync(path));
        return result.data;
    }
    getDataFromExcelData(data, format = {}) {
        data = data.slice();
        const fields = data.shift();
        data = data.filter((item) => !!item.length);
        if (!data.length) {
            throw new Error('数据为空');
        }
        const list = [];
        data.forEach((item) => {
            const ret = {};
            item.forEach((value, index) => {
                const field = format[fields[index]] || fields[index];
                ret[field] = value;
            });
            list.push(ret);
        });
        return list;
    }
    geneExcel(listData, fields) {
        const group = listData.map((item) => {
            const values = [];
            fields.forEach((field) => {
                values.push(item[field]);
            });
            return values;
        });
        return node_xlsx_1.default.build([
            {
                name: '模板',
                data: [fields, ...group]
            }
        ]);
    }
}
exports.excelTool = excelTool;
