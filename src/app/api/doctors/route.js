import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Duty from '@/lib/models/Duty';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    await connectDB();

    const filter = { role: 'doctor', isActive: true };
    if (department) filter.department = department;

    const doctors = await User.find(filter).select('username name surname department avatar');

    const onDutyRecords = await Duty.find({ status: 'on' });
    const onDutyUserIds = onDutyRecords.map(d => d.userId.toString());

    const doctorsWithDuty = doctors.map(doc => ({
      _id: doc._id,
      username: doc.username,
      name: doc.name,
      surname: doc.surname,
      department: doc.department,
      avatar: doc.avatar,
      onDuty: onDutyUserIds.includes(doc._id.toString()),
    }));

    return NextResponse.json({ doctors: doctorsWithDuty });
  } catch (error) {
    console.error('Doctors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
