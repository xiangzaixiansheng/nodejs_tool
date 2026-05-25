import { Context } from "koa";
export declare class AuthController {
    login(ctx: Context): Promise<import("../../util/requestRes").ErrorResult | import("../../util/requestRes").SuccessResult<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }> | {
        success: boolean;
        error: string;
        requestId: any;
    }>;
    getCurrentUser(ctx: Context): Promise<import("../../util/requestRes").ErrorResult | import("../../util/requestRes").SuccessResult<{
        userId: string;
        email: string;
    }> | {
        success: boolean;
        error: string;
        requestId: any;
    }>;
}
export default AuthController;
//# sourceMappingURL=auth.d.ts.map