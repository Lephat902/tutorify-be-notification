import { Injectable } from "@nestjs/common";
import {
    ApplicationStatus,
    ClassApplicationCreatedEventPayload,
    ClassApplicationUpdatedEventPayload,
    FeedbackCreatedEventPayload,
} from "@tutorify/shared";
import { NotificationQueryDto } from "./dtos";
import { NotificationType } from "./entities/enums/notification-type.enum";
import { NotificationRepository } from "./notification.repository";
import { APIGatewayProxy } from "./proxies";
import { Utils } from "./utils";

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly _APIGatewayProxy: APIGatewayProxy,
    ) { }

    async getNotifications(filters: NotificationQueryDto) {
        return this.notificationRepository.getNotifications(filters);
    }

    async markNotificationAs(userId: string, ids: string[], status: 'read' | 'deleted') {
        return this.notificationRepository.markNotificationsAs(userId, ids, status);
    }

    // CLASS APPLICATION

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
        const cl = await this._APIGatewayProxy.getClassById(payload.classId);
        const { class: classData } = cl;
        const { student, title: classTitle } = classData;
        const studentFullName = Utils.getFullName(student);

        return this.notificationRepository.saveNewNotification(
            {
                studentName: studentFullName,
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
            payload.tutorId
        );
        const { student, title: classTitle } = cl;
        const tutorFullName = Utils.getFullName(tutor);

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: tutorFullName,
                classTitle,
                ...payload,
            },
            NotificationType.CLASS_APPLICATION_CREATED,
            payload.tutorId,
            [student.id],
            tutor?.avatar?.url,
        );
    }

    async handleApplicationStatusChanged(payload: ClassApplicationUpdatedEventPayload) {
        const { newStatus, isDesignated } = payload;

        if (newStatus === ApplicationStatus.APPROVED) {
            if (isDesignated)
                return this.sendTutoringRequestApprovedToStudent(payload);
            else
                return this.sendClassApplicationApprovedToTutor(payload);
        }
    }

    private async sendTutoringRequestApprovedToStudent(
        payload: ClassApplicationUpdatedEventPayload,
    ) {
        const { class: cl, tutor } = await this._APIGatewayProxy.getClassAndTutor(
            payload.classId,
            payload.tutorId
        );
        const { student, title: classTitle } = cl;
        const tutorFullName = Utils.getFullName(tutor);

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: tutorFullName,
                classTitle,
                ...payload,
            },
            NotificationType.TUTORING_REQUEST_APPROVED,
            payload.tutorId,
            [student.id],
            tutor?.avatar?.url,
        );
    }

    private async sendClassApplicationApprovedToTutor(
        payload: ClassApplicationUpdatedEventPayload,
    ) {
        const { class: cl } = await this._APIGatewayProxy.getClassById(
            payload.classId,
        );
        const { student, title: classTitle } = cl;
        const studentName = Utils.getFullName(student);

        return this.notificationRepository.saveNewNotification(
            {
                studentName,
                classTitle,
                ...payload,
            },
            NotificationType.CLASS_APPLICATION_APPROVED,
            student.id,
            [payload.tutorId],
            student?.avatar?.url,
        );
    }

    // TUTOR FEEDBACK

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

    // CLASS SESSION
}