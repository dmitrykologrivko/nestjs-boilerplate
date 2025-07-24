import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractWhereQuery } from '../utils/query.utils';
import { fromExpressRequest, RequestFactory } from '../request/request.utils';

export const Where = (
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
        return extractWhereQuery(request, data.fieldSeparator);
    })({ fieldSeparator, requestFactory });
};
