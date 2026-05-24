import { Context } from "koa";
export default class UserController {
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
//# sourceMappingURL=user.d.ts.map