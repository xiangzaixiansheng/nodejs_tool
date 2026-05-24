export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
export declare function verifyToken(token: string): JwtPayload;
export declare function decodeToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map