import { createParamDecorator } from '@nestjs/common';

const AUTHORIZATION_HEADER = 'authorization';

export const BearerToken = createParamDecorator(
    (data: unknown, req: any) => {
        if (!req.headers.hasOwnProperty(AUTHORIZATION_HEADER)) {
            return null;
        }

        return req.headers[AUTHORIZATION_HEADER].replace(/^Bearer\s/, '');
    },
);
