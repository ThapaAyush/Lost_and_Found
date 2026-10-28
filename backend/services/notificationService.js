import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendNotificationEmail } from './emailService.js';

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedItem = null,
  relatedClaim = null,
  relatedConversation = null,
  sendEmailNotification = false,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedItem,
      relatedClaim,
      relatedConversation,
    });

    if (sendEmailNotification) {
      const user = await User.findById(recipient).select('email name');
      if (user && user.email) {
        sendNotificationEmail(user, title, message).catch((err) =>
          console.error('[Notification Email Error]', err.message)
        );
      }
    }

    return notification;
  } catch (error) {
    console.error('[CreateNotification Error]', error.message);
    return null;
  }
};
