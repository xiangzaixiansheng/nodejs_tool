import { Context } from "koa";
import { ApiService } from "../../service/ApiService";
import { wrap } from '../../util/requestRes';
import { post, get, put, del } from "../../util/decorator/httpMethod";

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
    @get("/testRedis")
    public async login(ctx: Context) {
        return ctx.body = await wrap(this.service.testRedis());
    }
}