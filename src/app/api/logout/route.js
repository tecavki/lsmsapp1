import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  const session = await getSession(request, response);

  session.destroy();
  return response;
}
