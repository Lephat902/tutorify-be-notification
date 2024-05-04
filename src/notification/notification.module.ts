import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationReceive, NotificationTrigger, NotificationType } from './entities';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { APIGatewayProxy } from './proxies';
import { NotificationRepository } from './notification.repository';
import { HttpModule } from '@nestjs/axios';

const entities = [
    NotificationTrigger,
    NotificationReceive,
    NotificationType,
    Notification,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(entities),
        TypeOrmModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                type: configService.get('DATABASE_TYPE'),
                url: configService.get('DATABASE_URI'),
                entities,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        HttpModule,
    ],
    providers: [
        NotificationService,
        NotificationRepository,
        APIGatewayProxy,
    ],
    controllers: [
        NotificationController,
    ],
    exports: [
        NotificationService,
    ],
})
export class NotificationModule { }