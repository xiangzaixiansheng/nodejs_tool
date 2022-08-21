import { logger } from '../util/logger';
import { createUser, getAllUserInfo } from '../repositories';
import { UsersEntity } from '../entities';

export class UserService {

    /**
     * @description
     * @returns 
     */
    public async getAll(data: any) {
        let { page, size } = data;

        page = this.processTakePageNum(page, 1);
        size = this.processTakePageNum(size, 100);

        const [listData, total] = await getAllUserInfo(page, size);
        return {
            listData,
            total
        };
    }

    public async create(data: Partial<UsersEntity>) {
        return await createUser(data)
    }

    private processTakePageNum(value: any, defaultValue: number) {
        value = Number(value);
        if (!value || value < 1) {
            return defaultValue;// 不允许非数字或者小于1的数字
        }
        return value;
    }

}