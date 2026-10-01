import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['HOT_LEAD', 'REPLY_RECEIVED', 'APPROVAL_REQUIRED', 'EMAIL_SENT', 'SYSTEM_ALERT'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export const Notification = mongoose.model('Notification', NotificationSchema);
