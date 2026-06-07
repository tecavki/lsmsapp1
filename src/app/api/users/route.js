import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
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
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const users = await User.find({}).sort({ createdAt: -1 });

    const dutyRecords = await Duty.find({ status: 'on' });
    const onDutyIds = dutyRecords.map(d => d.userId.toString());

    const usersWithDuty = users.map(u => ({
      _id: u._id,
      discordId: u.discordId,
      username: u.username,
      avatar: u.avatar,
      role: u.role,
      name: u.name,
      surname: u.surname,
      phone: u.phone,
      department: u.department,
      isActive: u.isActive,
      createdAt: u.createdAt,
      onDuty: onDutyIds.includes(u._id.toString()),
    }));

    return NextResponse.json({ users: usersWithDuty });
  } catch (error) {
    console.error('Users error:', error);
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
    const { userId, role, name, surname, phone, department, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (role) user.role = role;
    if (name !== undefined) user.name = name;
    if (surname !== undefined) user.surname = surname;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
