import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsPositive, Max } from "class-validator";
import { Lang } from "../enums";
import { Type } from "class-transformer";

export class NotificationQueryDto {
    @ApiHideProperty()
    userId: string;

    @IsOptional()
    @IsEnum(Lang)
    @ApiProperty({
        description: 'Language of the notification',
        enum: Lang,
        required: false,
    })
    lang: Lang;

    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({
        description: 'Page, start from 1',
        required: false,
    })
    page: number = 1;

    @IsOptional()
    @IsPositive()
    @Max(20)
    @Type(() => Number)
    @ApiProperty({
        description: 'Limit, default is 10',
        required: false,
    })
    limit: number = 10;
}