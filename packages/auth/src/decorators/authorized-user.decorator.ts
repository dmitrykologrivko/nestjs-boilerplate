import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { fromExpressRequest, RequestFactory } from '@nestjs-boilerplate/core';

export const AuthorizedUser = (
    requestFactory: RequestFactory = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator<{ requestFactory: RequestFactory }>((data, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return request.user;
    })({ requestFactory });
};
