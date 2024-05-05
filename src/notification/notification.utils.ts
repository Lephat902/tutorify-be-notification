import { Lang } from "./enums";
import { Notification, NotificationType } from './entities';
import handlebars from 'handlebars';

export class NotificationUtils {
    static getNotificationText(notification: Notification, lang: Lang) {
        const template = this.getTemplateByLang(notification.notificationType, lang);
        return handlebars.compile(template)(notification.data);
    }

    private static getTemplateByLang(notificationType: NotificationType, lang: Lang) {
        switch (lang) {
            case Lang.EN:
                return notificationType.templateEn;
            case Lang.VI:
                return notificationType.templateVi;
            default:
                return notificationType.templateEn;
        }
    }
}