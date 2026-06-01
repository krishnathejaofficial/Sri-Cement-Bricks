import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  label: { type: String },
  type: { type: String, enum: ['number', 'string', 'boolean', 'json'], default: 'string' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
