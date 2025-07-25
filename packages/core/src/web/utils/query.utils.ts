import { SearchQuery } from '../../application/filters/search.filter';
import { OrderingQuery } from '../../application/filters/ordering.filter';
import { WhereQuery, QUERY_NAME_CONDITION_REGEX } from '../../application/filters/where.filter';
import { PagePaginationQuery } from '../../application/pagination/page.pagination';
import { LimitOffsetPaginationQuery } from '../../application/pagination/limit-offset.pagination';
import { ListQuery } from '../../application/dto/list-query.interface';
import { safeParseInt } from '../../utils/safe.utils';
import { Request } from '../request/request';

export function extractSearchQuery(request: Request): SearchQuery {
    const { query } = request;

    const search: string = query.search || '';

    return {
        search,
    }
}

export function extractOrderingQuery(request: Request, fieldSeparator = '__'): OrderingQuery {
    const { query } = request;

    let sortBy: string[] = [];

    if (query.sortBy) {
        sortBy = Array.isArray(query.sortBy)
            ? (query.sortBy as string[])
                .filter(param => param.length > 0)
                .map(param => param.split(','))
                .reduce((prev, current) => [...prev, ...current])
                .map(param => param.split(fieldSeparator).join('.'))
            : (query.sortBy as string)
                .split(',')
                .map(param => param.split(fieldSeparator).join('.'));
    }

    return {
        sortBy,
    };
}

export function extractWhereQuery(request: Request, fieldSeparator = '__'): WhereQuery {
    const { query } = request;

    let where : [string, string][] = [];

    function mapCondition(param: string): [string, string] {
        const [ nameAndCondition, value ] = param.split('=');

        const match = nameAndCondition.match(QUERY_NAME_CONDITION_REGEX);

        if (!match) {
            return null;
        }

        return [
            `${match[1].split(fieldSeparator).join('.')}${match[2]}`,
            value,
        ];
    }

    if (query.where) {
        where = Array.isArray(query.where)
            ? (query.where as string[])
                .filter(param => param.length > 0)
                .map(mapCondition)
                .filter(param => param !== null)
            : [query.where as string]
                .map(mapCondition)
                .filter(param => param !== null);
    }

    return {
        where,
    };
}

function buildUrlFromRequest(request: Request) {
    return `${request.protocol}://${request.hostname}${request.url}`;
}

export function extractPagePaginationQuery(request: Request): PagePaginationQuery {
    const { query } = request;

    const page = query.page ? safeParseInt(query.page) : undefined;
    const limit = query.limit ? safeParseInt(query.limit) : undefined;

    return {
        page: !isNaN(page) ? page : undefined,
        limit: !isNaN(limit) ? limit : undefined,
        path: buildUrlFromRequest(request),
    }
}

export function extractLimitOffsetPaginationQuery(request: Request): LimitOffsetPaginationQuery {
    const { query } = request;

    const limit = query.limit ? safeParseInt(query.limit) : undefined;
    const offset = query.offset ? safeParseInt(query.offset) : undefined;

    return {
        limit: !isNaN(limit) ? limit : undefined,
        offset: !isNaN(offset) ? offset : undefined,
        path: buildUrlFromRequest(request),
    }
}

export function extractListQuery(request: Request, fieldSeparator = '__'): ListQuery {
    const { query, params } = request;

    return {
        query,
        params,
        ...extractOrderingQuery(request, fieldSeparator),
        ...extractSearchQuery(request),
        ...extractWhereQuery(request, fieldSeparator),
        ...extractPagePaginationQuery(request),
        ...extractLimitOffsetPaginationQuery(request),
    }
}
