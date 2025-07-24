import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractSearchQuery } from '../utils/query.utils';
import { Request } from '../request/request';
import { fromExpressRequest, RequestFactory } from '../request/request.utils';

export const Search = (
    requestFactory: RequestFactory = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator<{ requestFactory: RequestFactory }>((data, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return extractSearchQuery(request);
    })({ requestFactory });
};
