import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ValidationException } from '../../utils/validation/validation.exception';
import { NonFieldValidationException } from '../../utils/validation/non-field-validation.exception';
import { ValidationContainerException } from '../../utils/validation/validation-container.exception';

@Catch(ValidationException, NonFieldValidationException, ValidationContainerException)
export class ValidationExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const statusCode = 400;
        let message = [];

        if (exception instanceof ValidationException || exception instanceof NonFieldValidationException) {
            message.push(exception);
        }

        if (exception instanceof ValidationContainerException) {
            message = message.concat(exception.validationExceptions);
        }

        response.status(400).send({
            statusCode,
            error: 'Bad Request',
            message,
        });
    }
}
