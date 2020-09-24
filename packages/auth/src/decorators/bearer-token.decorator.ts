import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const AUTHORIZATION_HEADER = 'authorization';

export const BearerToken = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        if (!request.headers.hasOwnProperty(AUTHORIZATION_HEADER)) {
            return null;
        }

        return request.headers[AUTHORIZATION_HEADER].replace(/^Bearer\s/, '');
    },
);
