import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { fromExpressRequest, RequestFactory } from '@nestjs-boilerplate/core';

const AUTHORIZATION_HEADER = 'authorization';

export const BearerToken = (
    requestFactory: RequestFactory = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator<{ requestFactory: RequestFactory }>((data, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );

        if (!Object.prototype.hasOwnProperty.call(request.headers, AUTHORIZATION_HEADER)) {
            return null;
        }

        return request.headers[AUTHORIZATION_HEADER].replace(/^Bearer\s/, '');
    })({ requestFactory });
};
