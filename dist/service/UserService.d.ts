import { UsersEntity } from '../entities';
import { CreateUserInput, PaginationInput } from '../schemas';
export declare class UserService {
    getAll(data: PaginationInput): Promise<{
        listData: number | UsersEntity[] | undefined;
        total: number | UsersEntity[] | undefined;
        page: number;
        size: number;
    }>;
    create(data: CreateUserInput): Promise<Partial<UsersEntity> & UsersEntity>;
}
//# sourceMappingURL=UserService.d.ts.map