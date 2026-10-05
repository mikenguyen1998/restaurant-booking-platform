import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@restaurant-platform/database';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    res.status(status).json({
      statusCode: status,
      error: HttpStatus[status],
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): {
    status: number;
    message: string | string[];
  } {
    // Lỗi Nest: NotFoundException, BadRequest (kể cả lỗi từ ValidationPipe)...
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : (body as { message: string | string[] }).message;
      return { status: exception.getStatus(), message };
    }

    // Lỗi Prisma
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // vi phạm unique
          return {
            status: HttpStatus.CONFLICT,
            message: 'Resource already exists',
          };
        case 'P2025': // không tìm thấy bản ghi
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Resource not found',
          };
        case 'P2003': // vi phạm khóa ngoại
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid reference',
          };
      }
    }

    // Lỗi không lường trước: không lộ chi tiết ra ngoài
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
