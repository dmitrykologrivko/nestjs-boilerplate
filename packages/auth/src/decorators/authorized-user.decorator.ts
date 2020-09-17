import { createParamDecorator } from '@nestjs/common';

export const AuthorizedUser = createParamDecorator(
    (data: unknown, req: any) => {
        return req.user;
    },
);
