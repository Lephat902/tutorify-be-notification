import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import { UserSocketsMap } from './user-sockets.map';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
    path: '/notification',
    cors: {
        origin: ["null", null, "https://www.tutorify.site"],
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true,
})
@Controller()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private readonly server: Server;

    constructor(
        // system-user-id <-> [socket-client-id]
        private readonly userSocketsMap: UserSocketsMap
    ) { }

    async handleConnection(client: Socket): Promise<void> {
        console.log("XHDU");
        // const token = client.handshake?.query.token.toString();
        // const payload = this.authService.verifyAccessToken(token);

        // const userId: string = payload.id;

        // this.userSocketsMap.addConnection(client.id, userId);
    }

    async handleDisconnect(client: Socket) {
        // const userId = this.userSocketsMap.getUserIdByClientId(client.id);
        // this.userSocketsMap.removeConnection(client.id);
    }

    @AsyncApiPub({
        channel: 'ping',
        message: {
            payload: String
        },
        description: 'Used to check socket connection. Receive the same thing you sent to the server'
    })
    @SubscribeMessage('ping')
    async ping(@MessageBody() data: unknown) {
        return data;
    }
}
