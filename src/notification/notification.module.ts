import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProxiesModule } from '@tutorify/shared';
import { Controllers } from './controllers';
import { Notification, NotificationReceives, NotificationTrigger, User } from './entities';
import { Repositories } from './repositories';
import { Services } from './services';
import { NotificationService } from './services/notification.service';

const entities = [
    NotificationTrigger,
    NotificationReceives,
    Notification,
    User,
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
        ProxiesModule,
    ],
    providers: [
        ...Services,
        ...Repositories,
    ],
    controllers: Controllers,
    exports: [
        NotificationService,
    ],
})
export class NotificationModule { }