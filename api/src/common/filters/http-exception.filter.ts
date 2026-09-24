import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const message = typeof payload === 'object' && payload !== null && 'message' in payload ? payload.message : payload;

    const error = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : status >= 500 ? 'Internal Server Error' : status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : status === 404 ? 'Not Found' : 'Bad Request';

    response.status(status).json({
      statusCode: status,
      error,
      message,
      requestId: request.requestId ?? randomUUID(),
    });
  }
}
