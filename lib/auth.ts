import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production';

// Role is stored as String in SQLite (SQLite doesn't support native enums).
// Will be a proper enum in PostgreSQL when you migrate.
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'ACCOUNTANT';

export interface TokenPayload {
    userId: string;
    role: Role;
}

export const signToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
};

export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcryptjs.compare(password, hash);
};
