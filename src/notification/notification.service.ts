import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { NotificationQueryDto } from "./dtos";
import { Notification, NotificationType } from "./entities";
import Handlebars from "handlebars";
import { Lang } from "./enums";
import { notificationTypeSeeds } from "./seeds/notification-type.seed";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationType)
        private readonly notificationTypeRepository: Repository<NotificationType>,
    ) { }

    async getNotifications(filters: NotificationQueryDto) {
        // await this.notificationTypeRepository.save(notificationTypeSeeds);
        const query = this.createQueryBuilderWithEagerLoading();

        this.filterByUserId(query, filters.userId);
        this.paginateResults(query, filters.page, filters.limit);

        const [notifications, totalCount] = await query.getManyAndCount();
        notifications.forEach(notification => {
            notification.text = this.getNotificationText(notification, filters.lang);
        });

        return { results: notifications, totalCount };
    }

    private createQueryBuilderWithEagerLoading(): SelectQueryBuilder<Notification> {
        return this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.notificationType', 'notificationType')
            .leftJoinAndSelect('notification.notificationReceive', 'notificationReceive');
    }

    private filterByUserId(query: SelectQueryBuilder<Notification>, userId: string | undefined) {
        if (userId) {
            query.andWhere('notificationReceive.userId = :userId', {
                userId,
            });
        }
    }

    private paginateResults(query: SelectQueryBuilder<Notification>, page: number | undefined, limit: number | undefined) {
        if (page && limit) {
            query
                .skip((page - 1) * limit)
                .take(limit);
        }
    }

    private getNotificationText(notification: Notification, lang: Lang) {
        const template = this.getTemplateByLang(notification.notificationType, lang);
        return Handlebars.compile(template)(notification.data);
    }

    private getTemplateByLang(notificationType: NotificationType, lang: Lang) {
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