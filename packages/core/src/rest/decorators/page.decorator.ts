import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractPagePaginationQuery } from '../utils/query.utils';

export const Page = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractPagePaginationQuery(request);
    },
);
