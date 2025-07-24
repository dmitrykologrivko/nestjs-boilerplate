import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractLimitOffsetPaginationQuery } from '../utils/query.utils';
import { fromExpressRequest, RequestFactory } from '../request/request.utils';

export const LimitOffset = (
    requestFactory: RequestFactory = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator<{ requestFactory: RequestFactory }>((data, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return extractLimitOffsetPaginationQuery(request);
    })({ requestFactory });
};
