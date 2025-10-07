// src/models/User.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string; // This will be the hashed password
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);