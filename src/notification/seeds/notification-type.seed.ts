import { UserRole } from "@tutorify/shared";
import { NotificationType } from "../entities";
import { ActionType } from "../entities/enums/action-type.enum";
import { EntityType } from "../entities/enums/entity-type.enum";

export const notificationTypeSeeds: Omit<NotificationType, 'id' | 'notifications'>[] = [
    {
        actionType: ActionType.APPROVE,
        entityType: EntityType.CLASS_APPLICATION,
        triggererUserRole: UserRole.TUTOR,
        recipientUserRole: UserRole.STUDENT,
        templateVi: "Gia sư {{tutorName}} vừa chấp nhận lời mời nhận dạy lớp {{classTitle}} của bạn.",
        templateEn: "Tutor {{tutorName}} recently accepted your tutoring request for class {{classTitle}}.",
    },
    {
        actionType: ActionType.APPROVE,
        entityType: EntityType.CLASS_APPLICATION,
        triggererUserRole: UserRole.STUDENT,
        recipientUserRole: UserRole.TUTOR,
        templateVi: "Học sinh {{studentName}} vừa chấp nhận yêu cầu dạy lớp {{classTitle}} của bạn.",
        templateEn: "Student {{studentName}} recently accepted your class application for class {{classTitle}}.",
    },
    {
        actionType: ActionType.CREATE,
        entityType: EntityType.CLASS_APPLICATION,
        triggererUserRole: UserRole.TUTOR,
        recipientUserRole: UserRole.STUDENT,
        templateVi: "Gia sư {{tutorName}} vừa gửi một yêu cầu dạy lớp {{classTitle}} của bạn.",
        templateEn: "Tutor {{tutorName}} recently send a request to teach your class {{classTitle}}.",
    },
    {
        actionType: ActionType.CREATE,
        entityType: EntityType.CLASS_APPLICATION,
        triggererUserRole: UserRole.STUDENT,
        recipientUserRole: UserRole.TUTOR,
        templateVi: "Học sinh {{studentName}} vừa gửi yêu cầu dạy lớp {{classTitle}} cho bạn.",
        templateEn: "Student {{studentName}} recently sent you a tutoring request for class {{classTitle}}."
    },
    {
        actionType: ActionType.CREATE,
        entityType: EntityType.TUTOR_FEEDBACK,
        triggererUserRole: null,
        recipientUserRole: UserRole.TUTOR,
        templateVi: "{{userName}} vừa viết một nhận xét về bạn.",
        templateEn: "{{userName}} recently wrote a feedback about you."
    },
]