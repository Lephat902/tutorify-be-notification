import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { HealthCheckModule } from './health-check';
import { NotificationGatewayModule } from './notification-gateway';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
      envFilePath: ['.env', '.env.example'],
    }),
    NotificationGatewayModule,
    AuthModule,
    HealthCheckModule,
    NotificationModule,
  ],
})
export class AppModule { }
