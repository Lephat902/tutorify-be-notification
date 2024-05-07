import { Injectable } from "@nestjs/common";
import {
    FeedbackCreatedEventPayload
} from "@tutorify/shared";
import { NotificationType } from "../entities/enums/notification-type.enum";
import { NotificationRepository } from "../repositories";

@Injectable()
export class FeedbackNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
    ) { }

    async handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        const { userId, tutorId } = payload;

        return this.notificationRepository.saveNewNotification(
            payload,
            NotificationType.TUTOR_FEEDBACK_CREATED,
            userId,
            [tutorId],
        );
    }
}