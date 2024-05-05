import { FileUploadResponseDto } from "@tutorify/shared";

export type BasicUserInfoDto = {
    id: string;
    avatar: Pick<FileUploadResponseDto, 'url'>;
    lastName: string;
    firstName: string;
    middleName: string;
}