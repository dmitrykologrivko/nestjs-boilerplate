import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { CredentialsInvalidException } from '../exceptions/credentials-invalid.exception';

@Catch(CredentialsInvalidException)
export class CredentialsInvalidExceptionFilter implements ExceptionFilter {
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
