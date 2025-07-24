import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PermissionDeniedException } from '../../application/permissions/permission-denied.exception';

@Catch(PermissionDeniedException)
export class PermissionDeniedExceptionFilter implements ExceptionFilter {
    constructor(private readonly adapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.adapterHost;
        const ctx = host.switchToHttp();

        const body = {
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied',
        };

        httpAdapter.reply(ctx.getResponse(), body, 403);
    }
}
