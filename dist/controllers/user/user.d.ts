import { Context } from "koa";
export declare class UserController {
    private readonly service;
    constructor();
    getAll(ctx: Context): Promise<import("../../util/requestRes").WrapResult<{
        listData: number | import("../../entities").UsersEntity[] | undefined;
        total: number | import("../../entities").UsersEntity[] | undefined;
        page: number;
        size: number;
    }>>;
    create(ctx: Context): Promise<import("../../util/requestRes").WrapResult<Partial<import("../../entities").UsersEntity> & import("../../entities").UsersEntity>>;
}
export default UserController;
//# sourceMappingURL=user.d.ts.map