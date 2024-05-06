import { Injectable } from "@nestjs/common";
import {
    ClassApplicationCreatedEventPayload,
    ClassApplicationUpdatedEventPayload,
    FeedbackCreatedEventPayload
} from "@tutorify/shared";
import { NotificationQueryDto } from "../dtos";
import { NotificationRepository } from "../notification.repository";
import { ClassApplicationNotificationService } from "./class-application.notification.service";
import { FeedbackNotificationService } from "./feedback.notification.service";

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly classApplicationNotificationService: ClassApplicationNotificationService,
        private readonly feedbackNotificationService: FeedbackNotificationService,
    ) { }

    async getNotifications(filters: NotificationQueryDto) {
        return this.notificationRepository.getNotifications(filters);
    }

    async markNotificationAs(userId: string, ids: string[], status: 'read' | 'deleted') {
        return this.notificationRepository.markNotificationsAs(userId, ids, status);
    }

    // CLASS APPLICATION
    handleClassApplicationCreated(payload: ClassApplicationCreatedEventPayload) {
        return this.classApplicationNotificationService.handleClassApplicationCreated(payload);
    }

    handleApplicationStatusChanged(payload: ClassApplicationUpdatedEventPayload) {
        return this.classApplicationNotificationService.handleApplicationStatusChanged(payload);
    }

    // TUTOR FEEDBACK

    handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        return this.feedbackNotificationService.handleFeedbackCreated(payload);
    }

    // CLASS SESSION
}