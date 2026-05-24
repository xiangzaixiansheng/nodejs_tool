"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repositories_1 = require("../repositories");
class UserService {
    async getAll(data) {
        const page = data.page || 1;
        const size = data.size || 10;
        const [listData, total] = await (0, repositories_1.getAllUserInfo)(page, size);
        return {
            listData,
            total,
            page,
            size,
        };
    }
    async create(data) {
        return await (0, repositories_1.createUser)(data);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map