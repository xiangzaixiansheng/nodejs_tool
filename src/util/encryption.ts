import crypto from "crypto";
import { serverPubKey, clientPrivKey } from "../config/keys";

/**
 * RSA 公钥加密
 */
export function publicEncrypt(data: string): string {
    const encrypted = crypto.publicEncrypt(
        {
            key: serverPubKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(data, "utf8")
    );
    return encrypted.toString("base64");
}

/**
 * RSA 私钥解密
 */
export function privateDecrypt(data: string): string {
    const decrypted = crypto.privateDecrypt(
        {
            key: clientPrivKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(data, "base64")
    );
    return decrypted.toString("utf8");
}

/**
 * AES-256-GCM 加密
 */
export function aesEncrypt(data: string, key: string): string {
    const keyBuffer = crypto.createHash("sha256").update(key).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

    const encrypted = Buffer.concat([
        cipher.update(data, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    const result = Buffer.concat([iv, authTag, encrypted]);
    return result.toString("base64");
}

/**
 * AES-256-GCM 解密
 */
export function aesDecrypt(encryptedData: string, key: string): string {
    const keyBuffer = crypto.createHash("sha256").update(key).digest();
    const buffer = Buffer.from(encryptedData, "base64");

    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}
