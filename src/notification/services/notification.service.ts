import { Injectable } from "@nestjs/common";
import {
    ClassApplicationCreatedEventPayload,
    ClassApplicationUpdatedEventPayload,
    ClassSessionCreatedEventPayload,
    ClassSessionDeletedEventPayload,
    ClassSessionUpdatedEventPayload,
    FeedbackCreatedEventPayload
} from "@tutorify/shared";
import { NotificationQueryDto } from "../dtos";
import { NotificationRepository } from "../notification.repository";
import { ClassApplicationNotificationService } from "./class-application.notification.service";
import { FeedbackNotificationService } from "./feedback.notification.service";
import { ClassSessionNotificationService } from "./class-session.notification.service";

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly classApplicationNotificationService: ClassApplicationNotificationService,
        private readonly feedbackNotificationService: FeedbackNotificationService,
        private readonly classSessionNotificationService: ClassSessionNotificationService,
    ) { }

    getNotifications(filters: NotificationQueryDto) {
        return this.notificationRepository.getNotifications(filters);
    }

    markNotificationAs(userId: string, ids: string[], status: 'read' | 'deleted') {
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

    handleClassSessionCreated(payload: ClassSessionCreatedEventPayload) {
        console.log("Start sending session-created notification");
        return this.classSessionNotificationService.handleClassSessionCreated(payload);
    }

    handleClassSessionUpdated(payload: ClassSessionUpdatedEventPayload) {
        return this.classSessionNotificationService.handleClassSessionUpdated(payload);
    }

    handleClassSessionDeleted(payload: ClassSessionDeletedEventPayload) {
        return this.classSessionNotificationService.handleClassSessionDeleted(payload);
    }
}