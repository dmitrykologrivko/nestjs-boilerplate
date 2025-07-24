import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractListQuery } from '../utils/query.utils';
import { fromExpressRequest, RequestFactory } from '../request/request.utils';

export const ListFilter = (
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
        return extractListQuery(request, data.fieldSeparator);
    })({ fieldSeparator, requestFactory });
};
