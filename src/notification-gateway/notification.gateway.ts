import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway
} from '@nestjs/websockets';
import {
    ClassApplicationCreatedEventPattern,
    ClassApplicationCreatedEventPayload,
    ClassApplicationUpdatedEventPattern,
    ClassApplicationUpdatedEventPayload,
    ClassSessionCreatedEventPattern,
    ClassSessionCreatedEventPayload,
    ClassSessionDeletedEventPattern,
    ClassSessionDeletedEventPayload,
    ClassSessionUpdatedEventPattern,
    ClassSessionUpdatedEventPayload,
    FeedbackCreatedEventPattern,
    FeedbackCreatedEventPayload
} from '@tutorify/shared';
import { instanceToPlain } from 'class-transformer';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth';
import { NotificationService } from 'src/notification';
import { Notification } from 'src/notification/entities';
import { SocketEventPattern } from './socket-event-pattern.enum';
import { UserSocketsMap } from './user-sockets.map';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
    path: '/notifications/socket.io',
    cors: {
        origin: [
            "null",
            null,
            "https://www.tutorify.site",
            "https://tutorify-project.vercel.app",
            "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
})
@Controller()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly authService: AuthService,
        private readonly notificationService: NotificationService,
        // system-user-id <-> [socket-client-id]
        private readonly userSocketsMap: UserSocketsMap,
    ) { }

    handleConnection(client: Socket) {
        try {
            const { token } = client.handshake?.query;
            const payload = this.authService.validateAccessToken(token.toString());
            const userId = payload.id;

            // Handle adding new socket
            this.userSocketsMap.addConnection(client, userId);
        } catch (e) {
            console.log("The token may be invalid");
            client.emit('error', 'The token may be invalid');
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.userSocketsMap.getUserIdByClient(client);
        if (!userId) {
            console.log("Disconnect anonymous user socket");
            return;
        }
        // Handle deleting socket
        console.log(`Disconnect user ${userId} socket`);
        this.userSocketsMap.removeConnection(client);
    }

    @SubscribeMessage(SocketEventPattern.PING)
    ping(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
        client.emit(SocketEventPattern.PING, data);
    }

    // CLASS APPLICATION

    @EventPattern(new ClassApplicationCreatedEventPattern())
    async handleClassApplicationCreated(payload: ClassApplicationCreatedEventPayload) {
        const notification = await this.notificationService.handleClassApplicationCreated(payload);
        this.emitNotification(notification.notificationType, notification);
    }

    @EventPattern(new ClassApplicationUpdatedEventPattern())
    async handleApplicationStatusChanged(payload: ClassApplicationUpdatedEventPayload) {
        const notification = await this.notificationService.handleApplicationStatusChanged(payload);
        this.emitNotification(notification.notificationType, notification);
    }

    // TUTOR FEEDBACK

    @EventPattern(new FeedbackCreatedEventPattern())
    async handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        const notification = await this.notificationService.handleFeedbackCreated(payload);
        this.emitNotification(notification.notificationType, notification);
    }

    // CLASS SESSION

    @EventPattern(new ClassSessionCreatedEventPattern())
    async handleClassSessionCreated(payload: ClassSessionCreatedEventPayload) {
        const notification = await this.notificationService.handleClassSessionCreated(payload);
        this.emitNotification(notification.notificationType, notification);
    }

    @EventPattern(new ClassSessionUpdatedEventPattern())
    async handleClassSessionUpdated(payload: ClassSessionUpdatedEventPayload) {
        const notification = await this.notificationService.handleClassSessionUpdated(payload);
        this.emitNotification(notification.notificationType, notification);
    }

    @EventPattern(new ClassSessionDeletedEventPattern())
    async handleClassSessionDeleted(payload: ClassSessionDeletedEventPayload) {
        const notification = await this.notificationService.handleClassSessionDeleted(payload);
        this.emitNotification(notification.notificationType, notification);
    }

    private emitNotification(eventPattern: SocketEventPattern, notification: Notification) {
        // Get recipients ids
        const recipientsIds = notification.notificationReceives.map(rec => rec.userId);
        // Get all the connected sockets of those recipients
        const recipientsSockets = recipientsIds.flatMap(
            recipientsId => this.userSocketsMap.getSocketClientsByUserId(recipientsId)
        );

        // Serialize notification object
        const serializedNotification = instanceToPlain(notification);

        // Emit to all connected sockets
        recipientsSockets.forEach(socket => {
            socket.emit(eventPattern, serializedNotification);
        })
    }
}