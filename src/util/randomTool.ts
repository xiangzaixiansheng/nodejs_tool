import * as crypto from "crypto";

/**
 * 获取随机小写字母
 */
export function getRandomLower(): string {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

/**
 * 获取随机大写字母
 */
export function getRandomUpper(): string {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

/**
 * 获取随机数字字符
 */
export function getRandomNumber(): string {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

/**
 * 获取随机符号
 */
export function getRandomSymbol(): string {
    const symbols = '~!@#$%^&*()_+{}":?><;.,';
    return symbols[Math.floor(Math.random() * symbols.length)] ?? "!";
}

/**
 * 生成唯一字符串（基于 crypto）
 */
export function createUniqueString(): string {
    return crypto.randomUUID();
}

/**
 * 获取随机布尔值
 */
export function getRandomBool(): boolean {
    return Math.random() >= 0.5;
}

/**
 * 获取介于 min 和 max 之间的随机浮点数
 */
export function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * 获取介于 min 和 max 之间的随机整数
 */
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 生成指定长度的随机密码
 */
export function generatePassword(length: number = 16): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const bytes = crypto.randomBytes(length);
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset[bytes[i]! % charset.length];
    }
    return password;
}

/**
 * 生成加密安全的随机 hex 字符串
 */
export function randomHex(bytes: number = 16): string {
    return crypto.randomBytes(bytes).toString("hex");
}
