import { Context } from "koa";
export declare class AuthController {
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
export default AuthController;
//# sourceMappingURL=auth.d.ts.map