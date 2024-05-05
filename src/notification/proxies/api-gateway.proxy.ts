import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { BasicUserInfoDto, Class, Tutor } from "./dtos";

@Injectable()
export class APIGatewayProxy {
  constructor(
    private readonly httpService: HttpService,
  ) { }

  async getClassById(classId: string): Promise<Class> {
    const query = `
      query ExampleQuery($classId: String!) {
        class(id: $classId) {
          student {
            id
            avatar {
              url
            }
            lastName
            firstName
            middleName
          }
          title
        }
      }
    `;

    const variables = {
      classId
    };

    const data = await firstValueFrom(this.httpService.post<{
      data: Class;
    }>(
      process.env.API_GATEWAY_GRAPHQL_PATH,
      {
        query,
        variables,
      }
    ));

    return data.data.data;
  }

  async getClassAndTutor(classId: string, tutorId: string): Promise<Class & Tutor> {
    const query = `
      query ExampleQuery($tutorId: String!, $classId: String!) {
        class(id: $classId) {
          student {
            id
            avatar {
              url
            }
            lastName
            firstName
            middleName
          }
          title
        }
        tutor(id: $tutorId) {
          avatar {
            url
          }
          lastName
          firstName
          middleName
        }
      }
    `;

    const variables = {
      classId,
      tutorId,
    };

    const data = await firstValueFrom(this.httpService.post<{
      data: Class & Tutor;
    }>(
      process.env.API_GATEWAY_GRAPHQL_PATH,
      {
        query,
        variables,
      }
    ));

    return data.data.data;
  }

  async getTutor(tutorId: string): Promise<Tutor> {
    const query = `
      query ExampleQuery($tutorId: String!) {
        tutor(id: $tutorId) {
          avatar {
            url
          }
          lastName
          firstName
          middleName
        }
      }
    `;

    const variables = {
      tutorId,
    };

    const data = await firstValueFrom(this.httpService.post<{
      data: Tutor;
    }>(
      process.env.API_GATEWAY_GRAPHQL_PATH,
      {
        query,
        variables,
      }
    ));

    return data.data.data;
  }

  async getUser(userId: string): Promise<BasicUserInfoDto> {
    const query = `
      query ExampleQuery($userId: String!) {
        user(id: $userId) {
          id
          avatar {
            url
          }
          lastName
          firstName
          middleName
        }
      }
    `;

    const variables = {
      userId,
    };

    const data = await firstValueFrom(this.httpService.post<{
      data: {
        user: BasicUserInfoDto
      };
    }>(
      process.env.API_GATEWAY_GRAPHQL_PATH,
      {
        query,
        variables,
      }
    ));

    return data.data.data.user;
  }
}