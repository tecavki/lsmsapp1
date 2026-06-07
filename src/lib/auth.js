import { connectDB } from './mongodb';
import User from './models/User';

const DEPARTMENTS = [
  { value: 'acil', label: 'Acil Servis' },
  { value: 'cerrahi', label: 'Cerrahi' },
  { value: 'dahiliye', label: 'Dahiliye' },
  { value: 'klinik', label: 'Klinik' },
  { value: 'kardiyoloji', label: 'Kardiyoloji' },
  { value: 'noroloji', label: 'Noroloji' },
  { value: 'pediatri', label: 'Pediatri' },
];

const ROLES = {
  citizen: 'Vatandaş',
  doctor: 'Doktor',
  admin: 'Admin',
};

async function findOrCreateUser(discordUser) {
  await connectDB();

  let user = await User.findOne({ discordId: discordUser.id });

  if (!user) {
    user = await User.create({
      discordId: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      email: discordUser.email || null,
      role: 'citizen',
    });
  } else {
    user.username = discordUser.username;
    user.avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;
    if (discordUser.email) user.email = discordUser.email;
    await user.save();
  }

  return user;
}

function getDepartmentLabel(value) {
  const dept = DEPARTMENTS.find(d => d.value === value);
  return dept ? dept.label : value;
}

export { findOrCreateUser, DEPARTMENTS, ROLES, getDepartmentLabel };
