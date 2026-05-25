"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const fs_1 = __importDefault(require("fs"));
const requestRes_1 = require("../../util/requestRes");
const httpMethod_1 = require("../../util/decorator/httpMethod");
class ApiController {
    async uploadFile(ctx) {
        ctx.body = await (0, requestRes_1.wrap)(Promise.resolve("success"));
    }
    async download(ctx) {
        const filename = "readMe.txt";
        ctx.set('Content-Type', 'application/vnd.openxmlformats');
        ctx.set('Content-Disposition', 'attachment; filename=' + filename);
        const filePath = __dirname + `/../../download/${filename}`;
        if (!fs_1.default.existsSync(filePath)) {
            ctx.status = 404;
            ctx.body = { success: false, error: '文件不存在' };
            return;
        }
        ctx.body = fs_1.default.createReadStream(filePath);
    }
}
exports.ApiController = ApiController;
__decorate([
    (0, httpMethod_1.post)("/uploadFile"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "uploadFile", null);
__decorate([
    (0, httpMethod_1.get)('/download'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "download", null);
exports.default = ApiController;
//# sourceMappingURL=api.js.map