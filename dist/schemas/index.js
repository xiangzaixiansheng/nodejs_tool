"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.requestParamsSchema = exports.testArraySchema = exports.fileUploadSchema = exports.paginationSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('邮箱格式不正确'),
    name: zod_1.z.string().min(1, '姓名不能为空').max(16, '姓名最多16个字符'),
    sex: zod_1.z.enum(['0', '1']).optional().default('0').transform(Number),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().or(zod_1.z.number()).transform((v) => {
        const n = Number(v);
        return isNaN(n) || n < 1 ? 1 : n;
    }).optional(),
    size: zod_1.z.string().or(zod_1.z.number()).transform((v) => {
        const n = Number(v);
        return isNaN(n) || n < 1 || n > 100 ? 10 : n;
    }).optional(),
    array: zod_1.z.string().optional(),
});
exports.fileUploadSchema = zod_1.z.object({
    filename: zod_1.z.string().optional(),
});
exports.testArraySchema = zod_1.z.object({
    array: zod_1.z.string().optional(),
});
exports.requestParamsSchema = zod_1.z.object({
    array: zod_1.z.string().optional(),
    data: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('邮箱格式不正确'),
    password: zod_1.z.string().min(6, '密码至少6位'),
});
//# sourceMappingURL=index.js.map