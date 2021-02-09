import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractWhereQuery } from '../utils/query.utils';

export const Where = (fieldSeparator?: string): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractWhereQuery(request, data.fieldSeparator);
    })({ fieldSeparator });
};
