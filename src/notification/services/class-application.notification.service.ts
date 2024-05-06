import { Injectable } from "@nestjs/common";
import {
    ApplicationStatus,
    ClassApplicationCreatedEventPayload,
    ClassApplicationUpdatedEventPayload
} from "@tutorify/shared";
import { NotificationType } from "../entities/enums/notification-type.enum";
import { NotificationRepository } from "../notification.repository";
import { APIGatewayProxy } from "../proxies";
import { Utils } from "../utils";

@Injectable()
export class ClassApplicationNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly _APIGatewayProxy: APIGatewayProxy,
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
        const cl = await this._APIGatewayProxy.getClassById(payload.classId, true);
        const { class: classData } = cl;
        const { student, title: classTitle } = classData;

        return this.notificationRepository.saveNewNotification(
            {
                studentName: Utils.getFullName(student),
                classTitle,
                ...payload,
            },
            NotificationType.TUTORING_REQUEST_CREATED,
            student.id,
            [payload.tutorId],
            student?.avatar?.url,
        );
    }

    private async sendClassApplicationCreatedToStudent(
        payload: ClassApplicationCreatedEventPayload,
    ) {
        const { class: cl, tutor } = await this._APIGatewayProxy.getClassAndTutor(
            payload.classId,
            payload.tutorId,
            false,
        );
        const { studentId, title: classTitle } = cl;

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: Utils.getFullName(tutor),
                classTitle,
                ...payload,
            },
            NotificationType.CLASS_APPLICATION_CREATED,
            payload.tutorId,
            [studentId],
            tutor?.avatar?.url,
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
        const { class: cl, tutor } = await this._APIGatewayProxy.getClassAndTutor(
            payload.classId,
            payload.tutorId,
            false,
        );
        const { studentId, title: classTitle } = cl;

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: Utils.getFullName(tutor),
                classTitle,
                ...payload,
            },
            ClassApplicationNotificationService.determineNotificationTypeForUpdate(
                payload.newStatus,
                payload.isDesignated,
            ),
            payload.tutorId,
            [studentId],
            tutor?.avatar?.url,
        );
    }

    private async sendClassApplicationStatusChangedToTutor(
        payload: ClassApplicationUpdatedEventPayload,
    ) {
        const { class: cl } = await this._APIGatewayProxy.getClassById(
            payload.classId,
            true,
        );
        const { student, title: classTitle } = cl;

        return this.notificationRepository.saveNewNotification(
            {
                studentName: Utils.getFullName(student),
                classTitle,
                ...payload,
            },
            ClassApplicationNotificationService.determineNotificationTypeForUpdate(
                payload.newStatus,
                payload.isDesignated,
            ),
            student.id,
            [payload.tutorId],
            student?.avatar?.url,
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