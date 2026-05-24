export default class Encryption {
    privateDecrypt(data: string): Promise<string>;
    publicEncrypt(data: string): string;
    aesEncrypt(data: string, key: string): string;
    aesDecrypt(encrypt: string, key: any): Promise<string>;
}
//# sourceMappingURL=encryption.d.ts.map