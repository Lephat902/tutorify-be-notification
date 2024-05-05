import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { UserSocketsMap } from './user-sockets.map';
import { AuthModule } from 'src/auth';
import { NotificationModule } from 'src/notification';
import { SocketLangMap } from './socket-lang.map';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
  ],
  providers: [
    NotificationGateway,
    UserSocketsMap,
    SocketLangMap,
  ],
  controllers: [NotificationGateway],
})
export class NotificationGatewayModule { }
