"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getAllUserInfo = void 0;
const entities_1 = require("../entities");
const mysql_1 = require("../glues/mysql");
const getAllUserInfo = async (page, size) => {
    const repository = (0, mysql_1.getDataSource)().getRepository(entities_1.UsersEntity);
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
exports.getAllUserInfo = getAllUserInfo;
const createUser = async (data) => {
    const repository = (0, mysql_1.getDataSource)().getRepository(entities_1.UsersEntity);
    return await repository.save(data);
};
exports.createUser = createUser;
//# sourceMappingURL=users.js.map