import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './gateway';
import { AuthModule } from './auth';
import { HealthCheckModule } from './health-check';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
      envFilePath: ['.env', '.env.example'],
    }),
    NotificationModule,
    AuthModule,
    HealthCheckModule,
  ],
})
export class AppModule { }
