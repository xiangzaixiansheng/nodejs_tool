import { Like, DeepPartial } from "typeorm";
import { UsersEntity } from "../entities";


export const getAllUserInfo = async (page: number, size: number) => {
  const list = await UsersEntity.getRepository()
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
  const count = await UsersEntity.getRepository().count();
  return [list, count];
}

export const createUser = async (data: Partial<UsersEntity>) => {
  return await UsersEntity.getRepository().save(data);
}