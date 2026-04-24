import mongoose from 'mongoose';

export async function connectDB(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    tls: true,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
}
