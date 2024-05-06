import { ClassApplicationNotificationService } from './class-application.notification.service';
import { ClassSessionNotificationService } from './class-session.notification.service';
import { FeedbackNotificationService } from './feedback.notification.service';
import { NotificationService } from './notification.service';

export { NotificationService };

export const Services = [
    NotificationService,
    ClassApplicationNotificationService,
    FeedbackNotificationService,
    ClassSessionNotificationService,
];