import { createUser, getAllUserInfo } from '../repositories';
import { UsersEntity } from '../entities';
import { CreateUserInput, PaginationInput } from '../schemas';

export class UserService {
  /**
   * 获取全部的用户信息
   */
  public async getAll(data: PaginationInput) {
    const page = data.page || 1;
    const size = data.size || 10;

    const [listData, total] = await getAllUserInfo(page, size);
    return {
      listData,
      total,
      page,
      size,
    };
  }

  /**
   * 创建用户
   */
  public async create(data: CreateUserInput) {
    return await createUser(data as Partial<UsersEntity>);
  }
}
