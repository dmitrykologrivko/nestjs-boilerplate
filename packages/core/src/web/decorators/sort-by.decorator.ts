import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractOrderingQuery } from '../utils/query.utils';
import { fromExpressRequest, RequestFactory } from '../request/request.utils';

export const SortBy = (
    fieldSeparator?: string,
    requestFactory: RequestFactory = fromExpressRequest,
): ParameterDecorator => {
    type DataType = {
        requestFactory: RequestFactory;
        fieldSeparator?: string;
    };
    return createParamDecorator<DataType>((data, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return extractOrderingQuery(request, data.fieldSeparator);
    })({ fieldSeparator, requestFactory });
};
