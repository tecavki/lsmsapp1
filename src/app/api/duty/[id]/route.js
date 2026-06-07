import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Duty from '@/lib/models/Duty';
import { getSession } from '@/lib/session';

async function getSessionUser(request) {
  const response = NextResponse.next();
  const session = await getSession(request, response);
  return session?.user || null;
}

export async function PATCH(request, { params }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    const duty = await Duty.findById(id);
    if (!duty) {
      return NextResponse.json({ error: 'Duty record not found' }, { status: 404 });
    }

    if (body.status === 'on' || body.status === 'off') {
      duty.status = body.status;
      if (body.status === 'on') {
        duty.startedAt = new Date();
        duty.endedAt = null;
      } else {
        duty.endedAt = new Date();
      }
      await duty.save();
    }

    return NextResponse.json({ duty });
  } catch (error) {
    console.error('Update duty error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
