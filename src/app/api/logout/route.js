import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const req = new Request(request.url, { headers: { cookie: request.headers.get('cookie') || '' } });
  const res = new NextResponse();
  const session = await getSession(req, res);

  session.destroy();

  const response = NextResponse.redirect(new URL('/', request.url));
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    response.headers.set('set-cookie', setCookieHeader);
  }

  return response;
}
