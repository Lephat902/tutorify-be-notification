import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationReceives, NotificationTrigger } from './entities';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { APIGatewayProxy } from './proxies';
import { Services } from './services';
import { NotificationService } from './services/notification.service';

const entities = [
    NotificationTrigger,
    NotificationReceives,
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
        ...Services,
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