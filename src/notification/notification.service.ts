import { Injectable } from "@nestjs/common";
import { ClassApplicationCreatedEventPayload, FeedbackCreatedEventPayload, UserRole } from "@tutorify/shared";
import { NotificationQueryDto } from "./dtos";
import { ActionType } from "./entities/enums/action-type.enum";
import { EntityType } from "./entities/enums/entity-type.enum";
import { NotificationRepository } from "./notification.repository";
import { APIGatewayProxy } from "./proxies";
import { BasicUserInfoDto } from "./proxies/dtos";
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

    async handleClassApplicationCreated(payload: ClassApplicationCreatedEventPayload) {
        const { classId, tutorId, isDesignated } = payload;
        const { class: classData, tutor } = await this._APIGatewayProxy.getClassAndTutor(classId, tutorId);
        const student = classData.student;

        if (isDesignated) {
            return this.sendClassApplicationCreatedToTutor(student, classData.title, tutorId, payload);
        } else {
            return this.sendClassApplicationCreatedToStudent(tutor, classData.title, student.id, payload);
        }
    }

    private async sendClassApplicationCreatedToTutor(
        student: BasicUserInfoDto,
        classTitle: string,
        tutorId: string,
        payload: ClassApplicationCreatedEventPayload,
    ) {
        const studentFullName = Utils.getFullName(student);

        return this.notificationRepository.saveNewNotification(
            {
                studentName: studentFullName,
                classTitle: classTitle,
                ...payload,
            },
            {
                actionType: ActionType.CREATE,
                entityType: EntityType.CLASS_APPLICATION,
                triggererUserRole: UserRole.STUDENT,
                recipientUserRole: UserRole.TUTOR,
            },
            student.id,
            [tutorId],
        );
    }

    private async sendClassApplicationCreatedToStudent(
        tutor: BasicUserInfoDto,
        classTitle: string,
        studentId: string,
        payload: ClassApplicationCreatedEventPayload,
    ) {
        const tutorFullName = Utils.getFullName(tutor);

        return this.notificationRepository.saveNewNotification(
            {
                tutorName: tutorFullName,
                classTitle: classTitle,
                ...payload,
            },
            {
                actionType: ActionType.CREATE,
                entityType: EntityType.CLASS_APPLICATION,
                triggererUserRole: UserRole.TUTOR,
                recipientUserRole: UserRole.STUDENT,
            },
            payload.tutorId,
            [studentId],
        );
    }

    async handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        const { userId, tutorId } = payload;
        const user = await this._APIGatewayProxy.getUser(userId);

        return this.notificationRepository.saveNewNotification(
            {
                userName: Utils.getFullName(user),
                ...payload,
            },
            {
                actionType: ActionType.CREATE,
                entityType: EntityType.TUTOR_FEEDBACK,
                triggererUserRole: null,
                recipientUserRole: UserRole.TUTOR,
            },
            userId,
            [tutorId],
        );
    }
}