import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';
import { getSession } from '@/lib/session';

async function getSessionUser(request) {
  const req = new Request(request.url, { headers: { cookie: request.headers.get('cookie') || '' } });
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session.user) return null;
  return session.user;
}

export async function PATCH(request, { params }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, notes } = body;

    await connectDB();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (sessionUser.role === 'doctor' && appointment.doctorId.toString() !== sessionUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionUser.role === 'citizen') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectDB();
    await Appointment.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
