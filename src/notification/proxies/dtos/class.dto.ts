import { BasicUserInfoDto } from "./basic-user-info.dto";

export type Class = {
    class: {
        title: string;
        studentId: string;
        student: BasicUserInfoDto;
    };
}