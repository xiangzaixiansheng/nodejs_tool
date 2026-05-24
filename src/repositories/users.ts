import { UsersEntity } from "../entities";
import { getDataSource } from "../glues/mysql";

export const getAllUserInfo = async (page: number, size: number) => {
  const repository = getDataSource().getRepository(UsersEntity);
  const list = await repository
    .createQueryBuilder('ui')
    .select([
      "ui.id",
      "ui.name",
      "ui.email",
    ])
    .skip((page - 1) * size)
    .take(size)
    .orderBy('ui.id', 'DESC')
    .getMany();
  const count = await repository.count();
  return [list, count];
};

export const createUser = async (data: Partial<UsersEntity>) => {
  const repository = getDataSource().getRepository(UsersEntity);
  return await repository.save(data);
};
