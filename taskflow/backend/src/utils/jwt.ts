import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_SECRET: Secret =
  (process.env.ACCESS_TOKEN_SECRET as Secret) || 'default-access-secret';

const REFRESH_TOKEN_SECRET: Secret =
  (process.env.REFRESH_TOKEN_SECRET as Secret) || 'default-refresh-secret';

const ACCESS_TOKEN_EXPIRY =
  (process.env.ACCESS_TOKEN_EXPIRY ?? '15m') as SignOptions['expiresIn'];

const REFRESH_TOKEN_EXPIRY =
  (process.env.REFRESH_TOKEN_EXPIRY ?? '7d') as SignOptions['expiresIn'];

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
};

export const generateRandomToken = (): string =>
  crypto.randomBytes(32).toString('hex');
