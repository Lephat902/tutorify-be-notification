import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { NotificationQueryDto } from "./dtos";
import { Notification, NotificationType } from "./entities";
import { SortingDirection } from "@tutorify/shared";

@Injectable()
export class NotificationRepository {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationType)
        private readonly notificationTypeRepository: Repository<NotificationType>,
    ) { }

    async getNotifications(filters: NotificationQueryDto) {
        // await this.notificationTypeRepository.save(notificationTypeSeeds);
        const query = this.createQueryBuilderWithEagerLoading();

        // Notification is ordered by triggeredAt ASCly automatically
        query.orderBy('notification.triggeredAt', SortingDirection.ASC);
        this.filterByUserId(query, filters.userId);
        this.getFromMarkItem(query, filters.markId, filters.getFromMarkDir);
        this.paginateResults(query, filters.page, filters.limit);

        const [notifications, totalCount] = await query.getManyAndCount();
        notifications.forEach(notification => {
            notification.setLang(filters.lang);
        });

        return { results: notifications, totalCount };
    }

    async saveNewNotification(
        payload: object,
        notificationType: Pick<
            NotificationType,
            'actionType' | 'entityType' | 'triggererUserRole' | 'recipientUserRole'
        >,
        triggererUserId: string,
        recipientUserIds: string[],
    ) {
        const existingNotificationType = await this.notificationTypeRepository.findOne({
            where: notificationType
        });
        if (!existingNotificationType) {
            throw new BadRequestException("Cannot handle this kind of event");
        }
        const newNotfication = this.notificationRepository.create({
            data: payload,
            notificationType: existingNotificationType,
            notificationTrigger: {
                userId: triggererUserId,
            },
            notificationReceives: recipientUserIds.map(userId => ({
                userId
            }))
        });

        return this.notificationRepository.save(newNotfication);
    }

    private createQueryBuilderWithEagerLoading(): SelectQueryBuilder<Notification> {
        return this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.notificationType', 'notificationType')
            .leftJoinAndSelect('notification.notificationReceives', 'notificationReceives');
    }

    private filterByUserId(query: SelectQueryBuilder<Notification>, userId: string | undefined) {
        if (userId) {
            query.andWhere('notificationReceives.userId = :userId', {
                userId,
            });
        }
    }

    private getFromMarkItem(
        query: SelectQueryBuilder<Notification>,
        markId: string | undefined,
        getFromMarkDir: SortingDirection | undefined,
    ) {
        if (markId) {
            const markTriggeredAtSubQuery = this.notificationRepository.createQueryBuilder('notification')
                .select('notification.triggeredAt')
                .where('notification.id = :markId', { markId });

            const comparisonOperator = getFromMarkDir === SortingDirection.ASC ? '>' : '<';
            query.andWhere(
                `notification.triggeredAt ${comparisonOperator} (` + markTriggeredAtSubQuery.getQuery() + ')',
                { markId }
            );
        }
    }

    private paginateResults(query: SelectQueryBuilder<Notification>, page: number | undefined, limit: number | undefined) {
        if (page && limit) {
            query
                .skip((page - 1) * limit)
                .take(limit);
        }
    }
}