import { z } from 'zod';

/**
 * 用户相关校验 Schema
 */

// 创建用户
export const createUserSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  name: z.string().min(1, '姓名不能为空').max(16, '姓名最多16个字符'),
  sex: z.enum(['0', '1']).optional().default('0').transform(Number),
});

// 分页查询
export const paginationSchema = z.object({
  page: z.string().or(z.number()).transform((v) => {
    const n = Number(v);
    return isNaN(n) || n < 1 ? 1 : n;
  }).optional(),
  size: z.string().or(z.number()).transform((v) => {
    const n = Number(v);
    return isNaN(n) || n < 1 || n > 100 ? 10 : n;
  }).optional(),
  // 测试数组用的字段
  array: z.string().optional(),
});

// 文件上传（用于 query 校验）
export const fileUploadSchema = z.object({
  filename: z.string().optional(),
});

// 数组测试
export const testArraySchema = z.object({
  array: z.string().optional(),
});

// 请求参数校验 Schema
export const requestParamsSchema = z.object({
  array: z.string().optional(),
  data: z.string().optional(),
});

// JWT 登录
export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
