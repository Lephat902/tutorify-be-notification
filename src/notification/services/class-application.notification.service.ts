import { Injectable } from "@nestjs/common";
import {
    ApplicationStatus,
    ClassApplicationCreatedEventPayload,
    ClassApplicationUpdatedEventPayload,
    ClassProxy
} from "@tutorify/shared";
import { NotificationType } from "../entities/enums/notification-type.enum";
import { NotificationRepository } from "../repositories";
import { Class } from "../proxy-dtos";

@Injectable()
export class ClassApplicationNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly classProxy: ClassProxy,
    ) { }

    async handleClassApplicationCreated(payload: ClassApplicationCreatedEventPayload) {
        if (payload.isDesignated) {
            return this.sendTutoringRequestCreatedToTutor(payload);
        } else {
            return this.sendClassApplicationCreatedToStudent(payload);
        }
    }

    private async sendTutoringRequestCreatedToTutor(
        payload: ClassApplicationCreatedEventPayload
    ) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload,
            },
            NotificationType.TUTORING_REQUEST_CREATED,
            studentId,
            [payload.tutorId],
        );
    }

    private async sendClassApplicationCreatedToStudent(
        payload: ClassApplicationCreatedEventPayload,
    ) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload,
            },
            NotificationType.CLASS_APPLICATION_CREATED,
            payload.tutorId,
            [studentId],
        );
    }

    async handleApplicationStatusChanged(payload: ClassApplicationUpdatedEventPayload) {
        const { newStatus, isDesignated } = payload;

        if (newStatus === ApplicationStatus.APPROVED || newStatus === ApplicationStatus.REJECTED) {
            return isDesignated ?
                this.sendClassApplicationStatusChangedToStudent(payload) :
                this.sendClassApplicationStatusChangedToTutor(payload);
        }
        if (newStatus === ApplicationStatus.CANCELLED) {
            return this.sendClassApplicationStatusChangedToStudent(payload);
        }
    }

    private async sendClassApplicationStatusChangedToStudent(
        payload: ClassApplicationUpdatedEventPayload,
    ) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload,
            },
            ClassApplicationNotificationService.determineNotificationTypeForUpdate(
                payload.newStatus,
                payload.isDesignated,
            ),
            payload.tutorId,
            [studentId],
        );
    }

    private async sendClassApplicationStatusChangedToTutor(
        payload: ClassApplicationUpdatedEventPayload,
    ) {
        const classData = await this.classProxy.getClassById<Class>(payload.classId);
        const { studentId, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                classTitle,
                ...payload,
            },
            ClassApplicationNotificationService.determineNotificationTypeForUpdate(
                payload.newStatus,
                payload.isDesignated,
            ),
            studentId,
            [payload.tutorId],
        );
    }

    private static determineNotificationTypeForUpdate(newStatus: ApplicationStatus, isDesignated: boolean) {
        const statusToNotificationTypeMap = {
            [ApplicationStatus.APPROVED]: isDesignated ?
                NotificationType.TUTORING_REQUEST_APPROVED :
                NotificationType.CLASS_APPLICATION_APPROVED,
            [ApplicationStatus.REJECTED]: isDesignated ?
                NotificationType.TUTORING_REQUEST_REJECTED :
                NotificationType.CLASS_APPLICATION_REJECTED,
            [ApplicationStatus.CANCELLED]: NotificationType.CLASS_APPLICATION_CANCELLED
        };

        return statusToNotificationTypeMap[newStatus];
    }
}