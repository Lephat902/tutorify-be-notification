import { BasicUserInfoDto } from "./proxies/dtos";

export class Utils {
    static getFullName(user: BasicUserInfoDto) {
        return `${user.firstName} ${user.middleName} ${user.lastName}`;
    }
}