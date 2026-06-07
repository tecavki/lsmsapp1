import mongoose from 'mongoose';

const dutySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['on', 'off'], default: 'off' },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

dutySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Duty || mongoose.model('Duty', dutySchema);
