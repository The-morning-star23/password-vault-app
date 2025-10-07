// src/models/VaultItem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string; // This will be encrypted
  username: string; // This will be encrypted
  encryptedData: string; // Combined encrypted blob of password, URL, and notes
}

const VaultItemSchema: Schema<IVaultItem> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  encryptedData: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);