import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';

@Catch(AccessTokenInvalidException)
export class AccessTokenInvalidExceptionFilter implements ExceptionFilter {
    constructor(private readonly adapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.adapterHost;
        const ctx = host.switchToHttp();

        const body = {
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
        };

        httpAdapter.reply(ctx.getResponse(), body, 401);
    }
}
