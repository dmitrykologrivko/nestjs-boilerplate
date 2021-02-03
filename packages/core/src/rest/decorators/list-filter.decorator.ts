import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractListQuery } from '../utils/query.utils';

export const ListFilter = (fieldSeparator?: string): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractListQuery(request, data.fieldSeparator);
    })({ fieldSeparator });
};
