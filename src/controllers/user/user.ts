import { Context } from "koa";
import { UserService } from "../../service/UserService";
import { wrap } from '../../util/requestRes';
import { post, get, put, del } from "../../util/decorator/httpMethod";


export default class UserController {
    /**
     * 逻辑处理service类
     */
    private readonly service: UserService;

    constructor() {
        this.service = new UserService();
    }

    /**
     * 获取全部的用户信息
     * @param ctx 
     * @returns 
     */
    @get("/getAll")
    public async getAll(ctx: Context) {
        return ctx.body = await wrap(this.service.getAll(ctx.query));
    }

    @post("/create")
    public async create(ctx: Context) {
        //@ts-ignore
        return ctx.body = await wrap(this.service.create(ctx.request?.body));
    }

}