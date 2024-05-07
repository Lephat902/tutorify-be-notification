import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SortingDirection } from "@tutorify/shared";
import { Repository, SelectQueryBuilder } from "typeorm";
import { NotificationQueryDto } from "./dtos";
import { Notification, NotificationReceives } from "./entities";
import { NotificationType } from "./entities/enums/notification-type.enum";

@Injectable()
export class NotificationRepository {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async getNotifications(filters: NotificationQueryDto) {
        const query = this.createQueryBuilderWithEagerLoading();

        // Notification is ordered by triggeredAt ASCly automatically
        query.orderBy('notification.triggeredAt', SortingDirection.DESC);
        // Automatically exclude deleted notification (marked with isDeleted)
        query.andWhere('notificationReceives.isDeleted = false');
        this.filterByUserId(query, filters.userId);
        this.getFromMarkItem(query, filters.markId, filters.getFromMarkDir);
        this.paginateResults(query, filters.page, filters.limit);

        const [results, totalCount] = await query.getManyAndCount();

        return { results, totalCount };
    }

    async saveNewNotification(
        payload: object,
        notificationType: NotificationType,
        triggererUserId: string,
        recipientUserIds: string[],
    ) {
        const newNotfication = this.notificationRepository.create({
            data: payload,
            notificationType,
            notificationTrigger: {
                userId: triggererUserId,
            },
            notificationReceives: recipientUserIds.map(userId => ({
                userId
            })),
        });

        return this.notificationRepository.save(newNotfication);
    }

    markNotificationsAs(userId: string, ids: string[], status: 'read' | 'deleted') {
        // isRead as a fallback is safer
        const columnToUpdate = status === 'deleted' ? 'isDeleted' : 'isRead';

        return this.notificationRepository.createQueryBuilder('notification')
            .innerJoin(NotificationReceives, 'notificationReceives')
            .andWhere('userId = :userId', { userId })
            .andWhere('notification.id IN (:...ids)', { ids })
            .update(NotificationReceives, { [columnToUpdate]: true })
            .execute();
    }

    private createQueryBuilderWithEagerLoading(): SelectQueryBuilder<Notification> {
        return this.notificationRepository
            .createQueryBuilder('notification')
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