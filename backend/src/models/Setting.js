import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  description: { type: String, default: '' },
  updated_at: { type: Date, default: Date.now }
});

export const Setting = mongoose.model('Setting', SettingSchema);
