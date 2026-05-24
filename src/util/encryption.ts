import crypto from "crypto";
import NodeRSA from "node-rsa";
import { serverPubKey, clientPrivKey } from "../config/keys";

/**
 * RSA私钥解密
 * @param data 待解密数据
 * @returns utf8
 */
export function privateDecrypt(data: string): string {
    const privateKey = new NodeRSA(clientPrivKey);
    privateKey.setOptions({ "encryptionScheme": "pkcs1" });
    return privateKey.decrypt(data, "utf8");
}

/**
 * RSA公钥加密
 * @param data 待加密数据
 * @returns base64
 */
export function publicEncrypt(data: string): string {
    const pubKey = new NodeRSA(serverPubKey);
    pubKey.setOptions({ "encryptionScheme": "pkcs1" });
    return pubKey.encrypt(data, "base64");
}

/**
 * AES对称加密
 * @param data 加密数据体
 * @param key 密钥
 * @returns base64
 */
export function aesEncrypt(data: string, key: string): string {
    const cipherChunks: string[] = [];
    const cipher = crypto.createCipheriv("aes-128-ECB", key, "");
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, "utf8", "base64"));
    cipherChunks.push(cipher.final("base64"));
    return cipherChunks.join("");
}

/**
 * AES对称解密
 * @param encrypt 解密数据体
 * @param key 密钥
 * @returns utf8
 */
export function aesDecrypt(encrypt: string, key: string): string {
    const cipherChunks: string[] = [];
    const decipher = crypto.createDecipheriv("aes-128-ECB", key, "");
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(encrypt, "base64", "utf8"));
    cipherChunks.push(decipher.final("utf8"));
    return cipherChunks.join("");
}
