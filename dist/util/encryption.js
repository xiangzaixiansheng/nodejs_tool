"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicEncrypt = publicEncrypt;
exports.privateDecrypt = privateDecrypt;
exports.aesEncrypt = aesEncrypt;
exports.aesDecrypt = aesDecrypt;
const crypto_1 = __importDefault(require("crypto"));
const keys_1 = require("../config/keys");
function publicEncrypt(data) {
    const encrypted = crypto_1.default.publicEncrypt({
        key: keys_1.serverPubKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, Buffer.from(data, "utf8"));
    return encrypted.toString("base64");
}
function privateDecrypt(data) {
    const decrypted = crypto_1.default.privateDecrypt({
        key: keys_1.clientPrivKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, Buffer.from(data, "base64"));
    return decrypted.toString("utf8");
}
function aesEncrypt(data, key) {
    const keyBuffer = crypto_1.default.createHash("sha256").update(key).digest();
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", keyBuffer, iv);
    const encrypted = Buffer.concat([
        cipher.update(data, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const result = Buffer.concat([iv, authTag, encrypted]);
    return result.toString("base64");
}
function aesDecrypt(encryptedData, key) {
    const keyBuffer = crypto_1.default.createHash("sha256").update(key).digest();
    const buffer = Buffer.from(encryptedData, "base64");
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", keyBuffer, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}
//# sourceMappingURL=encryption.js.map