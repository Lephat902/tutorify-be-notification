import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { originCallback } from '@tutorify/shared';

export class CustomIoAdapter extends IoAdapter {
    private configService: ConfigService
    constructor(
        private app: INestApplicationContext,
    ) {
        super(app);
        this.configService = app.get(ConfigService);
    }

    createIOServer(port: number, options?: ServerOptions) {
        options.path = '/notifications/socket.io';
        options.cors = {
            origin: originCallback,
            credentials: true,
        };
        options.allowEIO3 = true;

        const server = super.createIOServer(port, options);
        return server;
    }
}
