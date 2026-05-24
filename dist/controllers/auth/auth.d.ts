import { Context } from "koa";
export default class AuthController {
    login(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    } | {
        success: boolean;
        error: string;
        requestId: any;
    }>;
    getCurrentUser(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    } | {
        success: boolean;
        error: string;
        requestId: any;
    }>;
}
//# sourceMappingURL=auth.d.ts.map