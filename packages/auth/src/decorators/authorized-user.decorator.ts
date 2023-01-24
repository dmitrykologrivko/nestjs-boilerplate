import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request, fromExpressRequest } from '@nestjs-boilerplate/core';

export const AuthorizedUser = (
    requestFactory: (req: any) => Request = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return request.user;
    })({ requestFactory });
};
