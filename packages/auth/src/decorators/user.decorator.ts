import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator(
    (data: unknown, req: any) => {
        return req.user;
    },
);
