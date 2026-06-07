import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const req = new Request(request.url, { headers: { cookie: request.headers.get('cookie') || '' } });
  const res = new NextResponse();
  const session = await getSession(req, res);

  if (!session.user) {
    return NextResponse.json({ user: null });
  }

  const setCookieHeader = res.headers.get('set-cookie');
  const response = NextResponse.json({ user: session.user });
  if (setCookieHeader) {
    response.headers.set('set-cookie', setCookieHeader);
  }

  return response;
}
