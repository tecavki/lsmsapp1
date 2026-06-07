import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Announcement from '@/lib/models/Announcement';
import { getSession } from '@/lib/session';

async function getSessionUser(request) {
  const response = NextResponse.next();
  const session = await getSession(request, response);
  return session?.user || null;
}

export async function DELETE(request, { params }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectDB();
    await Announcement.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
