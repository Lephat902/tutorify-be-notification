import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { UserSocketsMap } from './user-sockets.map';
import { AuthModule } from 'src/auth';
import { NotificationModule } from 'src/notification';

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
