import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
    extractOrderingQuery,
    extractSearchQuery,
    extractWhereQuery,
    extractPagePaginationQuery,
    extractLimitOffsetPaginationQuery,
} from './decorators.utils';

export const ListFilter = (fieldSeparator?: string): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return {
            ...extractOrderingQuery(request, data.fieldSeparator),
            ...extractSearchQuery(request),
            ...extractWhereQuery(request, data.fieldSeparator),
            ...extractPagePaginationQuery(request),
            ...extractLimitOffsetPaginationQuery(request),
        };
    })({ fieldSeparator });
};
