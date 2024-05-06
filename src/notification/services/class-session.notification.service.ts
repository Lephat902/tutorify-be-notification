import { Injectable } from "@nestjs/common";
import {
    ClassSessionCreatedEventPayload,
    ClassSessionDeletedEventPayload,
    ClassSessionUpdatedEventPayload
} from "@tutorify/shared";
import { NotificationType } from "../entities/enums/notification-type.enum";
import { NotificationRepository } from "../notification.repository";
import { APIGatewayProxy } from "../proxies";
import { Utils } from "../utils";

@Injectable()
export class ClassSessionNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly _APIGatewayProxy: APIGatewayProxy,
    ) { }

    async handleClassSessionCreated(payload: ClassSessionCreatedEventPayload) {
        const { class: classData, tutor } = await this._APIGatewayProxy.getClassAndTutor(
            payload.classId,
            payload.tutorId,
            false
        );
        const { studentId } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: Utils.getFullName(tutor),
                ...payload
            },
            NotificationType.CLASS_SESSION_CREATED,
            tutor.id,
            [studentId],
            tutor?.avatar?.url,
        );
    }

    async handleClassSessionUpdated(payload: ClassSessionUpdatedEventPayload) {
        const { class: classData, tutor } = await this._APIGatewayProxy.getClassAndTutor(
            payload.classId,
            payload.tutorId,
            false
        );
        const { studentId } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: Utils.getFullName(tutor),
                ...payload
            },
            ClassSessionNotificationService.determineNotificationTypeForUpdate(payload),
            tutor.id,
            [studentId],
            tutor?.avatar?.url,
        );
    }

    async handleClassSessionDeleted(payload: ClassSessionDeletedEventPayload) {
        const { class: classData, tutor } = await this._APIGatewayProxy.getClassAndTutor(
            payload.classId,
            payload.tutorId,
            false
        );
        const { studentId } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: Utils.getFullName(tutor),
                ...payload
            },
            NotificationType.CLASS_SESSION_DELETED,
            tutor.id,
            [studentId],
            tutor?.avatar?.url,
        );
    }

    private static determineNotificationTypeForUpdate(payload: ClassSessionUpdatedEventPayload) {
        const { updatedAt, feedbackUpdatedAt, isCancelled } = payload;

        if (!isCancelled && updatedAt && updatedAt === feedbackUpdatedAt)
            return NotificationType.CLASS_SESSION_FEEDBACK_UPDATED;
        else if (isCancelled && updatedAt)
            return NotificationType.CLASS_SESSION_CANCELLED;
    }
}