import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth';
import { NotificationModule } from 'src/notification';
import { NotificationGateway } from './notification.gateway';
import { UserSocketsMap } from './user-sockets.map';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
  ],
  providers: [
    NotificationGateway,
    UserSocketsMap,
  ],
  controllers: [NotificationGateway],
})
export class NotificationGatewayModule { }
