import { UsersEntity } from "../entities";
export declare const getAllUserInfo: (page: number, size: number) => Promise<(number | UsersEntity[])[]>;
export declare const createUser: (data: Partial<UsersEntity>) => Promise<Partial<UsersEntity> & UsersEntity>;
//# sourceMappingURL=users.d.ts.map