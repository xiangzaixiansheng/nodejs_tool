import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    sex: z.ZodPipe<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        0: "0";
        1: "1";
    }>>>, z.ZodTransform<number, "0" | "1">>;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodTransform<number, string | number>>>;
    size: z.ZodOptional<z.ZodPipe<z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodTransform<number, string | number>>>;
    array: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const fileUploadSchema: z.ZodObject<{
    filename: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const testArraySchema: z.ZodObject<{
    array: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const requestParamsSchema: z.ZodObject<{
    array: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=index.d.ts.map