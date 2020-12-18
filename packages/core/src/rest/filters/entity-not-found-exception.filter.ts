import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundException } from '../../domain/entities/entity-not-found.exception';

@Catch(EntityNotFoundException)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        response.status(404).json({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found',
        });
    }
}
