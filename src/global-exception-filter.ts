import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

type HttpExceptionObjectResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    try {
      if (exception instanceof HttpException) {
        console.log("HTTP EXCEPTION", exception);
        this.handleHttpException(exception, response);
      } else if (exception.error?.statusCode) {
        console.log("CAN BE CATEGORIZED AS HTTP EXCEPTION", exception);
        this.handleHttpException(new HttpException(exception.error.message, exception.error.statusCode), response);
      } else {
        console.log("UNHANDLED EXCEPTION", exception);
        this.handleHttpException(new InternalServerErrorException(exception), response);
      }
    } catch (e) {
      // It might be a GraphQL request
      console.log(exception);
      throw exception;
    }
  }

  private handleHttpException(exception: HttpException, response: Response) {
    const errorResponse = exception.getResponse() as HttpExceptionObjectResponse | string;
    let message: string[];
    if (typeof errorResponse === 'string') {
      message = [errorResponse];
    } else {
      // In this case, errorResponse is HttpExceptionObjectResponse
      const messageInErrorResponseObj = errorResponse.message;
      message = typeof messageInErrorResponseObj === 'string'
        ? [messageInErrorResponseObj]
        : messageInErrorResponseObj;
    }
    response.status(exception.getStatus()).json(message);
  }
}