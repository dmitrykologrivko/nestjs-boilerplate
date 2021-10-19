import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { PermissionDeniedException } from '../../application/permissions/permission-denied.exception';

@Catch(PermissionDeniedException)
export class PermissionDeniedExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        response.status(403).send({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied',
        });
    }
}
