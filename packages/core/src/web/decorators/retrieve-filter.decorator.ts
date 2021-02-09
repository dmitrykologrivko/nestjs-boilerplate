import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractRetrieveQuery } from '../utils/query.utils';

export const RetrieveFilter = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractRetrieveQuery(request);
    },
);
