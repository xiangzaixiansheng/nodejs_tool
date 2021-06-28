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
Object.defineProperty(exports, "__esModule", { value: true });
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
        return ctx.body = await requestRes_1.wrap(this.service.testArray());
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
exports.default = AuthController;
