import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';
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
    let appointments;

    if (sessionUser.role === 'admin') {
      appointments = await Appointment.find({})
        .populate('citizenId', 'username name surname')
        .populate('doctorId', 'username name surname department')
        .sort({ createdAt: -1 });
    } else if (sessionUser.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: sessionUser.id })
        .populate('citizenId', 'username name surname')
        .sort({ createdAt: -1 });
    } else {
      appointments = await Appointment.find({ citizenId: sessionUser.id })
        .populate('doctorId', 'username name surname department')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'citizen') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { doctorId, department, date, time, reason } = body;

    if (!doctorId || !department || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const appointment = await Appointment.create({
      citizenId: sessionUser.id,
      doctorId,
      department,
      date,
      time,
      reason: reason || '',
      status: 'pending',
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
