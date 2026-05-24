"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.decodeToken = decodeToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const keys_1 = require("../config/keys");
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, keys_1.jwtSecret, {
        expiresIn: keys_1.jwtExpiresIn,
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, keys_1.jwtSecret);
}
function decodeToken(token) {
    return jsonwebtoken_1.default.decode(token);
}
//# sourceMappingURL=jwt.js.map