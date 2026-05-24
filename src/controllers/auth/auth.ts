import { Context } from "koa";
import { post } from "../../util/decorator/httpMethod";
import { generateToken } from "../../util/jwt";
import { wrap } from '../../util/requestRes';
import { loginSchema } from "../../schemas";

/**
 * 认证 Controller
 * 处理登录、注册等认证相关接口
 */
export default class AuthController {
  /**
   * 用户登录
   * 实际项目中应该查询数据库验证密码
   */
  @post("/login")
  public async login(ctx: Context) {
    const validated = loginSchema.parse(ctx.request.body);

    // TODO: 实际项目中查询数据库验证密码
    // 这里仅作为示例
    if (validated.email === 'test@example.com' && validated.password === 'password123456') {
      const token = generateToken({
        userId: '1',
        email: validated.email,
      });

      return ctx.body = await wrap(Promise.resolve({
        token,
        user: {
          id: '1',
          email: validated.email,
          name: '测试用户',
        },
      }));
    }

    ctx.status = 401;
    return ctx.body = {
      success: false,
      error: '邮箱或密码错误',
      requestId: ctx.state.requestId,
    };
  }

  /**
   * 获取当前用户信息
   * 需要认证
   */
  @post("/me")
  public async getCurrentUser(ctx: Context) {
    if (!ctx.user) {
      ctx.status = 401;
      return ctx.body = {
        success: false,
        error: '未登录',
        requestId: ctx.state.requestId,
      };
    }

    return ctx.body = await wrap(Promise.resolve({
      userId: ctx.user.userId,
      email: ctx.user.email,
    }));
  }
}
