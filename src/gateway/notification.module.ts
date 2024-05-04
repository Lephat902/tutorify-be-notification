import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { UserSocketsMap } from './user-sockets.map';
import { AuthModule } from 'src/auth';

@Module({
  imports: [
    AuthModule,
  ],
  providers: [
    NotificationGateway,
    UserSocketsMap,
  ],
  controllers: [NotificationGateway],
})
export class NotificationModule { }
