import { ZodSchema } from 'zod';
interface RouteMeta {
    name: string;
    method: string;
    path: string;
    isVerify?: boolean;
    schema?: ZodSchema;
    source?: 'body' | 'query' | 'params';
}
export declare function createValidatedMethod(method: string): (path: string, options?: {
    schema?: ZodSchema;
    source?: "body" | "query" | "params";
    isVerify?: boolean;
}) => (proto: any, name: string) => void;
export declare const postValidate: (path: string, options?: {
    schema?: ZodSchema;
    source?: "body" | "query" | "params";
    isVerify?: boolean;
}) => (proto: any, name: string) => void;
export declare const getValidate: (path: string, options?: {
    schema?: ZodSchema;
    source?: "body" | "query" | "params";
    isVerify?: boolean;
}) => (proto: any, name: string) => void;
export declare const putValidate: (path: string, options?: {
    schema?: ZodSchema;
    source?: "body" | "query" | "params";
    isVerify?: boolean;
}) => (proto: any, name: string) => void;
export declare const delValidate: (path: string, options?: {
    schema?: ZodSchema;
    source?: "body" | "query" | "params";
    isVerify?: boolean;
}) => (proto: any, name: string) => void;
export declare function applyValidation(ctx: any, route: RouteMeta): Promise<boolean>;
export {};
//# sourceMappingURL=validate.d.ts.map