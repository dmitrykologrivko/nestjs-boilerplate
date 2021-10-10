import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';

@Catch(AccessTokenInvalidException)
export class AccessTokenInvalidExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        response.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
        });
    }
}
