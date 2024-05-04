import { BasicUserInfoDto } from "./basic-user-info.dto";

export type Class = {
    class: {
        student: BasicUserInfoDto;
        title: string;
    };
}