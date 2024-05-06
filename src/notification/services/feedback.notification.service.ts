import { Injectable } from "@nestjs/common";
import {
    FeedbackCreatedEventPayload
} from "@tutorify/shared";
import { NotificationType } from "../entities/enums/notification-type.enum";
import { NotificationRepository } from "../notification.repository";
import { APIGatewayProxy } from "../proxies";
import { Utils } from "../utils";

@Injectable()
export class FeedbackNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly _APIGatewayProxy: APIGatewayProxy,
    ) { }

    async handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        const { userId, tutorId } = payload;
        const user = await this._APIGatewayProxy.getUser(userId);

        return this.notificationRepository.saveNewNotification(
            {
                userName: Utils.getFullName(user),
                ...payload,
            },
            NotificationType.TUTOR_FEEDBACK_CREATED,
            userId,
            [tutorId],
            user?.avatar?.url,
        );
    }
}