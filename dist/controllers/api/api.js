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
const fs_1 = __importDefault(require("fs"));
const ApiService_1 = require("../../service/ApiService");
const requestRes_1 = require("../../util/requestRes");
const httpMethod_1 = require("../../util/decorator/httpMethod");
class AuthController {
    constructor() {
        this.service = new ApiService_1.ApiService();
    }
    async login(ctx) {
        return ctx.body = await requestRes_1.wrap(this.service.testRedis());
    }
    async testArray(ctx) {
        let query = ctx.query;
        return ctx.body = await requestRes_1.wrap(this.service.testArray(query));
    }
    async testRequestV1(ctx) {
        return ctx.body = await requestRes_1.wrap(this.service.testRequestV1());
    }
    async uploadFile(ctx) {
        ctx.body = await requestRes_1.wrap(Promise.resolve("success"));
    }
    async download(ctx) {
        const filename = "readMe.txt";
        ctx.set('Content-Type', 'application/vnd.openxmlformats');
        ctx.set('Content-Disposition', 'attachment; filename=' + filename);
        ctx.body = fs_1.default.readFileSync(__dirname + `/../../download/${filename}`);
    }
}
__decorate([
    httpMethod_1.get("/testRedis"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    httpMethod_1.get("/testArray"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testArray", null);
__decorate([
    httpMethod_1.post("/testRequestV1"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testRequestV1", null);
__decorate([
    httpMethod_1.post("/uploadFile"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "uploadFile", null);
__decorate([
    httpMethod_1.get('/download'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "download", null);
exports.default = AuthController;
