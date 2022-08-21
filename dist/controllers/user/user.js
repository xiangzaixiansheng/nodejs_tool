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
const UserService_1 = require("../../service/UserService");
const requestRes_1 = require("../../util/requestRes");
const httpMethod_1 = require("../../util/decorator/httpMethod");
class UserController {
    constructor() {
        this.service = new UserService_1.UserService();
    }
    async getAll(ctx) {
        return ctx.body = await requestRes_1.wrap(this.service.getAll(ctx.query));
    }
    async create(ctx) {
        var _a;
        return ctx.body = await requestRes_1.wrap(this.service.create((_a = ctx.request) === null || _a === void 0 ? void 0 : _a.body));
    }
}
__decorate([
    httpMethod_1.get("/getAll"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAll", null);
__decorate([
    httpMethod_1.post("/create"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
exports.default = UserController;
