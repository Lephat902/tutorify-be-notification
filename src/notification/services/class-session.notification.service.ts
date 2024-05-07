import { Injectable } from "@nestjs/common";
import {
    ClassProxy,
    ClassSessionCreatedEventPayload,
    ClassSessionDeletedEventPayload,
    ClassSessionUpdatedEventPayload
} from "@tutorify/shared";
import { NotificationType } from "../entities/enums/notification-type.enum";
import { NotificationRepository } from "../repositories";
import { Class } from "../proxy-dtos";

@Injectable()
export class ClassSessionNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly classProxy: ClassProxy,
    ) { }

    async handleClassSessionCreated(payload: ClassSessionCreatedEventPayload) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload
            },
            NotificationType.CLASS_SESSION_CREATED,
            payload.tutorId,
            [studentId],
        );
    }

    async handleClassSessionUpdated(payload: ClassSessionUpdatedEventPayload) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload
            },
            ClassSessionNotificationService.determineNotificationTypeForUpdate(payload),
            payload.tutorId,
            [studentId],
        );
    }

    async handleClassSessionDeleted(payload: ClassSessionDeletedEventPayload) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload
            },
            NotificationType.CLASS_SESSION_DELETED,
            payload.tutorId,
            [studentId],
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