import { Context } from "koa";
import { ApiService } from "../service/ApiService";
import { wrap } from '../util/requestRes';
import { post, get, put, del } from "../util/decorator/httpMethod";

/**
 * 
 * api 测试controller类
 * 
 */
export default class AuthController {
    /**
     * 逻辑处理service类
     */
    private readonly service: ApiService;

    constructor() {
        this.service = new ApiService();
    }

    /**
     * test 接口
     * @param ctx 
     * @returns 
     */
    @post("/test")
    public async login(ctx: Context) {
        console.error("come in====")
        return ctx.body = await this.service.test();
    }
}