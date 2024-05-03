import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './gateway/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
      envFilePath: ['.env', '.env.example'],
    }),
    NotificationModule,
  ],
})
export class AppModule { }
