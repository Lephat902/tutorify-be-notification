import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { UserSocketsMap } from './user-sockets.map';

@Module({
  imports: [
  ],
  providers: [
    NotificationGateway,
    UserSocketsMap,
  ],
  controllers: [NotificationGateway],
})
export class NotificationModule { }
