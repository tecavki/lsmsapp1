import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findOrCreateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const discordUser = await userResponse.json();

    const user = await findOrCreateUser(discordUser);

    const cookieStore = cookies();
    const req = new Request(request.url, { headers: { cookie: request.headers.get('cookie') || '' } });
    const res = new NextResponse();
    const session = await getSession(req, res);

    session.user = {
      id: user._id.toString(),
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      name: user.name,
      surname: user.surname,
      department: user.department,
    };

    await session.save();

    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    const setCookieHeader = res.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
