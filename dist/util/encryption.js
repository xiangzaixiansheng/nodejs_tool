"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const NodeRSA = require("node-rsa");
const keys_1 = require("../config/keys");
class Encryption {
    async privateDecrypt(data) {
        const privateKey = new NodeRSA(keys_1.clientPrivKey);
        privateKey.setOptions({ "encryptionScheme": "pkcs1" });
        const decrypted = privateKey.decrypt(data, "utf8");
        return decrypted;
    }
    publicEncrypt(data) {
        const pubKey = new NodeRSA(keys_1.serverPubKey);
        pubKey.setOptions({ "encryptionScheme": "pkcs1" });
        const encrypted = pubKey.encrypt(data, "base64");
        return encrypted;
    }
    aesEncrypt(data, key) {
        const cipherChunks = [];
        const cipher = crypto.createCipheriv("aes-128-ECB", key, "");
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, "utf8", "base64"));
        cipherChunks.push(cipher.final("base64"));
        return cipherChunks.join("");
    }
    async aesDecrypt(encrypt, key) {
        const cipherChunks = [];
        const decipher = crypto.createDecipheriv("aes-128-ECB", key, "");
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(encrypt, "base64", "utf8"));
        cipherChunks.push(decipher.final("utf8"));
        return cipherChunks.join("").toString();
    }
}
exports.default = Encryption;
