import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractListQuery } from '../utils/query.utils';
import { Request } from '../request/request';
import { fromExpressRequest } from '../request/request.utils';

export const ListFilter = (
    fieldSeparator?: string,
    requestFactory: (req: any) => Request = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return extractListQuery(request, data.fieldSeparator);
    })({ fieldSeparator, requestFactory });
};
