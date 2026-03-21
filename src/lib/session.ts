import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
  jurisdiction?: string;
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_roundup_app_v2',
  cookieName: 'roundup_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
