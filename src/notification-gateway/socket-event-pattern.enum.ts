import { NotificationType } from "src/notification/entities/enums/notification-type.enum"

enum OtherEventPattern {
    PING = 'xxx',
}

export type SocketEventPattern = NotificationType | OtherEventPattern;
export const SocketEventPattern = { ...NotificationType, ...OtherEventPattern };