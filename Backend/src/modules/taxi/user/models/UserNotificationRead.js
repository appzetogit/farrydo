import mongoose from 'mongoose';

/// Which broadcast notifications each rider has read. Notifications are shared
/// across riders, so read state cannot live on the notification itself.
const userNotificationReadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    notificationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

userNotificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

export const UserNotificationRead =
  mongoose.models.TaxiUserNotificationRead ||
  mongoose.model('TaxiUserNotificationRead', userNotificationReadSchema);

export const isValidNotificationId = (id) => mongoose.isValidObjectId(id);
