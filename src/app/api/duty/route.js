import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Duty from '@/lib/models/Duty';
import { getSession } from '@/lib/session';

async function getSessionUser(request) {
  const req = new Request(request.url, { headers: { cookie: request.headers.get('cookie') || '' } });
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session.user) return null;
  return session.user;
}

export async function GET(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let duty;
    if (sessionUser.role === 'admin') {
      duty = await Duty.find({}).populate('userId', 'username name surname department').sort({ createdAt: -1 });
    } else {
      duty = await Duty.findOne({ userId: sessionUser.id });
    }

    return NextResponse.json({ duty });
  } catch (error) {
    console.error('Duty error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || (sessionUser.role !== 'doctor' && sessionUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let duty = await Duty.findOne({ userId: sessionUser.id });

    if (!duty) {
      duty = await Duty.create({
        userId: sessionUser.id,
        status: 'on',
        startedAt: new Date(),
      });
    } else {
      if (duty.status === 'on') {
        duty.status = 'off';
        duty.endedAt = new Date();
      } else {
        duty.status = 'on';
        duty.startedAt = new Date();
        duty.endedAt = null;
      }
      await duty.save();
    }

    return NextResponse.json({ duty });
  } catch (error) {
    console.error('Toggle duty error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
