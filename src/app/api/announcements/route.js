import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Announcement from '@/lib/models/Announcement';
import { getSession } from '@/lib/session';

async function getSessionUser(request) {
  const response = NextResponse.next();
  const session = await getSession(request, response);
  return session?.user || null;
}

export async function GET(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const announcements = await Announcement.find({})
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, targetRole } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: sessionUser.id,
      targetRole: targetRole || 'all',
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
