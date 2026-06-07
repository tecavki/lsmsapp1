import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String, default: null },
  email: { type: String, default: null },
  role: {
    type: String,
    enum: ['citizen', 'doctor', 'admin'],
    default: 'citizen',
  },
  name: { type: String, default: '' },
  surname: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: {
    type: String,
    enum: ['acil', 'cerrahi', 'dahiliye', 'klinik', 'kardiyoloji', 'noroloji', 'pediatri', ''],
    default: '',
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);
