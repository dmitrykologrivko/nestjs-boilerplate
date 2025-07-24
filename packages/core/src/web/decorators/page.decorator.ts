import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractPagePaginationQuery } from '../utils/query.utils';
import { fromExpressRequest, RequestFactory } from '../request/request.utils';

export const Page = (
    requestFactory: RequestFactory = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator<{ requestFactory: RequestFactory }>((data, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return extractPagePaginationQuery(request);
    })({ requestFactory });
};
