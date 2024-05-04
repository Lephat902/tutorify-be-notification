import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AccessToken, TokenType } from "@tutorify/shared";
import { Token, TokenRequirements } from "src/auth/decorators";
import { NotificationQueryDto } from "./dtos";
import { NotificationService } from "./notification.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TokenGuard } from "src/auth/guards";

@Controller()
@ApiTags('Notification')
@UseGuards(TokenGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    @Get('me')
    @TokenRequirements(TokenType.CLIENT, [])
    @ApiOperation({ summary: 'User get his own notifications.' })
    @ApiBearerAuth()
    async getNotifications(
        @Query() filters: NotificationQueryDto,
        @Token() token: AccessToken,
    ) {
        filters.userId = token.id;
        return this.notificationService.getNotifications(filters);
    }
}