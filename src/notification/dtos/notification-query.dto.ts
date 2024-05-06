import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { SortingDirection } from "@tutorify/shared";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsPositive, IsString, Max } from "class-validator";

export class NotificationQueryDto {
    @ApiHideProperty()
    userId: string;

    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({
        description: 'Page, start from 1',
        required: false,
        default: 1,
    })
    page: number = 1;

    @IsOptional()
    @IsPositive()
    @Max(20)
    @Type(() => Number)
    @ApiProperty({
        description: 'Limit, default is 10',
        required: false,
        default: 10,
    })
    limit: number = 10;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Mark ID',
        required: false,
    })
    markId: string;

    @IsOptional()
    @IsEnum(SortingDirection)
    @ApiProperty({
        description: 'Get notifications from mark direction. DESC means backward, ASC is forward',
        enum: SortingDirection,
        required: false,
        default: SortingDirection.DESC,
    })
    getFromMarkDir: SortingDirection;
}