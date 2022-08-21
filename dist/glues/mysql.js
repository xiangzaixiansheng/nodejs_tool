"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMysqlConnection = void 0;
const typeorm_1 = require("typeorm");
const config_1 = __importDefault(require("../config"));
function createMysqlConnection() {
    const config = config_1.default();
    return typeorm_1.createConnection(config.mysql);
}
exports.createMysqlConnection = createMysqlConnection;
