import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Response } from 'express';

type HttpExceptionObjectResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class GlobalExceptionsFilter extends BaseWsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    console.log(exception);
    if (request) {
      // This is an HTTP request
      this.handleHttpException(exception, response);
    } else {
      // This is a WebSocket event
      this.handleWsException(exception, host);
    }
  }

  private handleHttpException(exception: any, response: Response) {
    let httpException: HttpException;
    if (exception instanceof HttpException) {
      httpException = exception;
    } else if (exception.error?.statusCode) {
      httpException = new HttpException(exception.error.message, exception.error.statusCode);
    } else {
      httpException = new InternalServerErrorException(exception);
    }

    const errorResponse = httpException.getResponse() as HttpExceptionObjectResponse | string;
    let message: string[];
    if (typeof errorResponse === 'string') {
      message = [errorResponse];
    } else {
      const messageInErrorResponseObj = errorResponse.message;
      message = typeof messageInErrorResponseObj === 'string'
        ? [messageInErrorResponseObj]
        : messageInErrorResponseObj;
    }
    response.status(httpException.getStatus()).json(message);
  }

  private handleWsException(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const data = host.switchToWs().getData();
    let error: any;
    if (exception instanceof WsException) {
      error = exception.getError();
    } else if (exception.error?.statusCode) {
      error = { message: exception.error.message, statusCode: exception.error.statusCode };
    } else {
      error = { message: 'Internal server error', statusCode: 500 };
    }
    const details = error instanceof Object ? { ...error } : { message: error };
    client.send(JSON.stringify({
      event: 'error',
      data: {
        id: (client as any).id,
        rid: data.rid,
        ...details
      }
    }));
  }
}