import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'lsms_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export async function GET(request) {
  const response = NextResponse.json({});
  const session = await getIronSession(request, response, sessionOptions);
  return NextResponse.json({ user: session.user || null });
}
