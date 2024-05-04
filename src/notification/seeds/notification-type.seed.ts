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
    }
]