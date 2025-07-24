import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationException } from '../../utils/validation/validation.exception';
import { NonFieldValidationException } from '../../utils/validation/non-field-validation.exception';
import { ValidationContainerException } from '../../utils/validation/validation-container.exception';

@Catch(ValidationException, NonFieldValidationException, ValidationContainerException)
export class ValidationExceptionsFilter implements ExceptionFilter {
    constructor(private readonly adapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.adapterHost;
        const ctx = host.switchToHttp();

        const statusCode = 400;
        let message = [];

        if (exception instanceof ValidationException || exception instanceof NonFieldValidationException) {
            message.push(exception);
        }

        if (exception instanceof ValidationContainerException) {
            message = message.concat(exception.validationExceptions);
        }

        const body = {
            statusCode,
            error: 'Bad Request',
            message,
        };

        httpAdapter.reply(ctx.getResponse(), body, 400);
    }
}
