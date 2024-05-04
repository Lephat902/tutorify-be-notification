import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserSocketsMap } from './user-sockets.map';
import { AuthService } from 'src/auth';
import { EventPattern } from '@nestjs/microservices';
import {
    ClassApplicationCreatedEventPattern,
    ClassApplicationCreatedEventPayload,
    FeedbackCreatedEventPattern,
    FeedbackCreatedEventPayload
} from '@tutorify/shared';
import { NotificationService } from 'src/notification';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
    path: '/notification/socket.io', // Uncomment it when working without nginx
    cors: {
        origin: ["null", null, "https://www.tutorify.site", "https://tutorify-project.vercel.app"],
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
        private readonly userSocketsMap: UserSocketsMap
    ) { }

    handleConnection(client: Socket) {
        try {
            const token = client.handshake?.query.token.toString();
            const payload = this.authService.validateAccessToken(token);

            const userId: string = payload.id;

            this.userSocketsMap.addConnection(client.id, userId);
        } catch (e) {
            console.log("The token may be invalid");
            client.emit('error', 'The token may be invalid');
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.userSocketsMap.getUserIdByClientId(client.id);
        if (!userId) {
            console.log("Disconnect anonymous user socket");
            return;
        }
        console.log(`Disconnect user ${userId} socket`);
        this.userSocketsMap.removeConnection(client.id);
    }

    @SubscribeMessage('xxx')
    ping(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
        client.emit('xxx', data);
    }

    @EventPattern(new ClassApplicationCreatedEventPattern())
    handleClassApplicationCreated(payload: ClassApplicationCreatedEventPayload) {
        return this.notificationService.handleClassApplicationCreated(payload);
    }

    @EventPattern(new FeedbackCreatedEventPattern())
    handleFeedbackCreated(payload: FeedbackCreatedEventPayload) {
        return this.notificationService.handleFeedbackCreated(payload);
    }
}
