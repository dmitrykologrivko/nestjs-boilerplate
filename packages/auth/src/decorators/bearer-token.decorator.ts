import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request, fromExpressRequest } from '@nestjs-boilerplate/core';

const AUTHORIZATION_HEADER = 'authorization';

export const BearerToken = (
    requestFactory: (req: any) => Request = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );

        if (!request.headers.hasOwnProperty(AUTHORIZATION_HEADER)) {
            return null;
        }

        return request.headers[AUTHORIZATION_HEADER].replace(/^Bearer\s/, '');
    })({ requestFactory });
};
