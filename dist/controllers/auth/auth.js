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
exports.AuthController = void 0;
const httpMethod_1 = require("../../util/decorator/httpMethod");
const jwt_1 = require("../../util/jwt");
const requestRes_1 = require("../../util/requestRes");
const schemas_1 = require("../../schemas");
class AuthController {
    async login(ctx) {
        const validated = schemas_1.loginSchema.parse(ctx.request.body);
        if (validated.email === 'test@example.com' && validated.password === 'password123456') {
            const token = (0, jwt_1.generateToken)({
                userId: '1',
                email: validated.email,
            });
            return ctx.body = await (0, requestRes_1.wrap)(Promise.resolve({
                token,
                user: {
                    id: '1',
                    email: validated.email,
                    name: '测试用户',
                },
            }));
        }
        ctx.status = 401;
        return ctx.body = {
            success: false,
            error: '邮箱或密码错误',
            requestId: ctx.state.requestId,
        };
    }
    async getCurrentUser(ctx) {
        if (!ctx.user) {
            ctx.status = 401;
            return ctx.body = {
                success: false,
                error: '未登录',
                requestId: ctx.state.requestId,
            };
        }
        return ctx.body = await (0, requestRes_1.wrap)(Promise.resolve({
            userId: ctx.user.userId,
            email: ctx.user.email,
        }));
    }
}
exports.AuthController = AuthController;
__decorate([
    (0, httpMethod_1.post)("/login"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, httpMethod_1.post)("/me"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.default = AuthController;
//# sourceMappingURL=auth.js.map