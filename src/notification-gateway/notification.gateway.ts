import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {
    ClassApplicationCreatedEventPattern,
    ClassApplicationCreatedEventPayload,
    FeedbackCreatedEventPattern,
    FeedbackCreatedEventPayload
} from '@tutorify/shared';
import { instanceToPlain } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth';
import { NotificationService } from 'src/notification';
import { Notification } from 'src/notification/entities';
import { Lang } from 'src/notification/enums';
import { EventPattern as EventPatternEnum } from './event-pattern.enum';
import { UserSocketsMap } from './user-sockets.map';
import { SocketLangMap } from './socket-lang.map';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
    path: '/notification/socket.io', // Uncomment it when working without nginx
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
    @WebSocketServer()
    private readonly server: Server;

    constructor(
        private readonly authService: AuthService,
        private readonly notificationService: NotificationService,
        // system-user-id <-> [socket-client-id]
        private readonly userSocketsMap: UserSocketsMap,
        private readonly socketLangPref: SocketLangMap,
    ) { }

    handleConnection(client: Socket) {
        try {
            const { token, lang } = client.handshake?.query;
            const payload = this.authService.validateAccessToken(token.toString());
            const userId = payload.id;

            // Handle adding new socket
            this.userSocketsMap.addConnection(client, userId);

            // Save socket lang preference
            this.socketLangPref.set(client, NotificationGateway.convertLangStrToEnum(lang.toString()));
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

        // Delete socket lang preference
        this.socketLangPref.delete(client);
    }

    @SubscribeMessage(EventPatternEnum.PING)
    ping(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
        client.emit(EventPatternEnum.PING, data);
    }

    @EventPattern(new ClassApplicationCreatedEventPattern())
    async handleClassApplicationCreated(payload: ClassApplicationCreatedEventPayload) {
        const notification = await this.notificationService.handleClassApplicationCreated(payload);
        this.emitNotification(EventPatternEnum.CLASS_APPLICATION_CREATED, notification);
    }

    @EventPattern(new FeedbackCreatedEventPattern())
    async handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        const notification = await this.notificationService.handleFeedbackCreated(payload);
        this.emitNotification(EventPatternEnum.TUTOR_FEEDBACK_CREATED, notification);
    }

    private emitNotification(eventPattern: EventPatternEnum, notification: Notification) {
        // Get recipients ids
        const recipientsIds = notification.notificationReceives.map(rec => rec.userId);
        // Get all the connected sockets of those recipients
        const recipientsSockets = recipientsIds.flatMap(
            recipientsId => this.userSocketsMap.getSocketClientsByUserId(recipientsId)
        );

        // Emit to all connected sockets
        recipientsSockets.forEach(socket => {
            const currentSocketLangPref = this.socketLangPref.get(socket);
            notification.setLang(currentSocketLangPref);
            // Serialize notification object
            const serializedNotification = instanceToPlain(notification);
            socket.emit(eventPattern, serializedNotification);
        })
    }

    private static convertLangStrToEnum(value: string): Lang {
        if (Object.values(Lang).includes(value as Lang)) {
            return value as Lang;
        }
        return Lang.EN;
    }
}