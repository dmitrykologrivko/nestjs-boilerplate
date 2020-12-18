import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { PermissionDeniedException } from '../../domain/permissions/permission-denied.exception';

@Catch(PermissionDeniedException)
export class PermissionDeniedExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        response.status(403).json({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied',
        });
    }
}
