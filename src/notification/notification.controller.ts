import { Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessToken, TokenType } from "@tutorify/shared";
import { Token, TokenRequirements } from "src/auth/decorators";
import { TokenGuard } from "src/auth/guards";
import { NotificationQueryDto } from "./dtos";
import { NotificationService } from "./notification.service";

@Controller('notifications')
@ApiTags('Notification')
@UseGuards(TokenGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    @Get()
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

    @Patch(':id/read')
    @TokenRequirements(TokenType.CLIENT, [])
    @ApiOperation({ summary: 'User marks a notification as read.' })
    @ApiBearerAuth()
    async markNotificationAsRead(
        @Param('id') id: string,
        @Token() token: AccessToken,
    ) {
        return this.notificationService.markNotificationAs(token.id, [id], "read");
    }

    @Delete(':id')
    @TokenRequirements(TokenType.CLIENT, [])
    @ApiOperation({ summary: 'User deletes a notification from his view.' })
    @ApiBearerAuth()
    async markNotificationAsDeleted(
        @Param('id') id: string,
        @Token() token: AccessToken,
    ) {
        return this.notificationService.markNotificationAs(token.id, [id], "deleted");
    }
}