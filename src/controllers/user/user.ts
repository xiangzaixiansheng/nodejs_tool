import { Context } from "koa";
import { UserService } from "../../service/UserService";
import { wrap } from '../../util/requestRes';
import { post, get } from "../../util/decorator/httpMethod";
import { createUserSchema, paginationSchema } from "../../schemas";

export class UserController {
  private readonly service: UserService;

  constructor() {
    this.service = new UserService();
  }

  /**
   * 获取全部的用户信息
   */
  @get("/getAll")
  public async getAll(ctx: Context) {
    // 校验 query 参数
    const validated = paginationSchema.parse(ctx.query);
    return ctx.body = await wrap(this.service.getAll(validated));
  }

  /**
   * 创建用户
   */
  @post("/create")
  public async create(ctx: Context) {
    // 校验 body 参数
    const validated = createUserSchema.parse(ctx.request.body);
    return ctx.body = await wrap(this.service.create(validated));
  }
}

export default UserController;
