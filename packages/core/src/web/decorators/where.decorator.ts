import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractWhereQuery } from '../utils/query.utils';
import { Request } from '../request/request';
import { fromExpressRequest } from '../request/request.utils';

export const Where = (
    fieldSeparator?: string,
    requestFactory: (req: any) => Request = fromExpressRequest,
): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = data.requestFactory(
            ctx.switchToHttp().getRequest(),
        );
        return extractWhereQuery(request, data.fieldSeparator);
    })({ fieldSeparator, requestFactory });
};
