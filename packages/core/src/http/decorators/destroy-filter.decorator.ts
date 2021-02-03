import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractDestroyQuery } from '../utils/query.utils';

export const DestroyFilter = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractDestroyQuery(request);
    },
);
