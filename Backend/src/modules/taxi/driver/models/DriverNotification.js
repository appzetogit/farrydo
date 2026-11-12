import mongoose from 'mongoose';

/// A notification addressed to one driver (profile approved, and the like),
/// shown in the driver app's notification list next to the admin broadcasts.
const driverNotificationSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    body: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      default: 'general',
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'taxidrivernotifications',
  },
);

driverNotificationSchema.index({ driverId: 1, createdAt: -1 });

export const DriverNotification =
  mongoose.models.DriverNotification || mongoose.model('DriverNotification', driverNotificationSchema);
