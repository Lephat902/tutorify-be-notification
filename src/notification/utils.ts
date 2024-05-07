import { BasicUserInfoDto } from "./proxy-dtos";

export class Utils {
    static getFullName(user: BasicUserInfoDto) {
        return [user.firstName, user.middleName, user.lastName]
            .filter(name => name) // This will remove any undefined or empty strings
            .join(' '); // This will join the names with a space
    }
}