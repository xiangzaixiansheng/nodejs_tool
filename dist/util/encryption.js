"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateDecrypt = privateDecrypt;
exports.publicEncrypt = publicEncrypt;
exports.aesEncrypt = aesEncrypt;
exports.aesDecrypt = aesDecrypt;
const crypto_1 = __importDefault(require("crypto"));
const node_rsa_1 = __importDefault(require("node-rsa"));
const keys_1 = require("../config/keys");
function privateDecrypt(data) {
    const privateKey = new node_rsa_1.default(keys_1.clientPrivKey);
    privateKey.setOptions({ "encryptionScheme": "pkcs1" });
    return privateKey.decrypt(data, "utf8");
}
function publicEncrypt(data) {
    const pubKey = new node_rsa_1.default(keys_1.serverPubKey);
    pubKey.setOptions({ "encryptionScheme": "pkcs1" });
    return pubKey.encrypt(data, "base64");
}
function aesEncrypt(data, key) {
    const cipherChunks = [];
    const cipher = crypto_1.default.createCipheriv("aes-128-ECB", key, "");
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, "utf8", "base64"));
    cipherChunks.push(cipher.final("base64"));
    return cipherChunks.join("");
}
function aesDecrypt(encrypt, key) {
    const cipherChunks = [];
    const decipher = crypto_1.default.createDecipheriv("aes-128-ECB", key, "");
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(encrypt, "base64", "utf8"));
    cipherChunks.push(decipher.final("utf8"));
    return cipherChunks.join("");
}
//# sourceMappingURL=encryption.js.map