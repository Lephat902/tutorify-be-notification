import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        JwtModule.registerAsync({
            // without useFactory and async, SECRET cannot be read by configService
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('SECRET'),
                global: true,
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule { }
