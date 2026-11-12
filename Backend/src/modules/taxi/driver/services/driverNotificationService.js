import { DriverNotification } from '../models/DriverNotification.js';
import { sendPushNotificationToEntities } from '../../services/pushNotificationService.js';

/**
 * Tells one driver something: stores it for the app's notification list, then
 * sends the push. The stored copy is written first so the message is there
 * even when the push fails (no FCM token, phone offline).
 */
export const notifyDriver = async ({ driverId, title, body, type = 'general', data = {} }) => {
  const notification = await DriverNotification.create({
    driverId,
    title,
    body,
    type,
    data,
  });

  await sendPushNotificationToEntities({
    driverIds: [String(driverId)],
    title,
    body,
    data: { ...data, type, notificationId: String(notification._id) },
  }).catch((error) => console.error('Driver push failed', String(driverId), error.message));

  return notification;
};
