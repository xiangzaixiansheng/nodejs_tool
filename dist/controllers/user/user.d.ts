import { Context } from "koa";
export declare class UserController {
    private readonly service;
    constructor();
    getAll(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    }>;
    create(ctx: Context): Promise<{
        statusCode: number;
        data?: any;
        msg?: string;
    }>;
}
export default UserController;
//# sourceMappingURL=user.d.ts.map