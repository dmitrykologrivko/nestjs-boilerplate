import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';

@Catch(ResetPasswordTokenInvalidException)
export class ResetPasswordTokenInvalidExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        response.status(401).json({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
        });
    }
}
