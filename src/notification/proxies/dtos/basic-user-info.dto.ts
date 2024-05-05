import { FileUploadResponseDto } from "@tutorify/shared";

export type BasicUserInfoDto = {
    id: string;
    avatar: FileUploadResponseDto;
    lastName: string;
    firstName: string;
    middleName: string;
}