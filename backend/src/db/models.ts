import mongoose, { Schema } from 'mongoose';

const transform = (_: unknown, ret: Record<string, unknown>) => {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.__v;
};

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});
userSchema.set('toJSON', { transform });

const workoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
workoutSchema.set('toJSON', { transform });

const entrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  workoutId: { type: Schema.Types.ObjectId, required: true, ref: 'Workout' },
  date: { type: String, required: true },
  reps: { type: Number, required: true },
});
entrySchema.set('toJSON', { transform });

export const User = mongoose.model('User', userSchema);
export const Workout = mongoose.model('Workout', workoutSchema);
export const Entry = mongoose.model('Entry', entrySchema);
