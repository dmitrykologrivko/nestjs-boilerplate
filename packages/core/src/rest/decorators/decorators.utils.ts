import { SearchQuery } from '../../domain/filters/search.filter';
import { OrderingQuery } from '../../domain/filters/ordering.filter';
import { WhereQuery, QUERY_NAME_CONDITION_REGEX } from '../../domain/filters/where.filter';
import { PagePaginationQuery } from '../../domain/pagination/page.pagination';
import { LimitOffsetPaginationQuery } from '../../domain/pagination/limit-offset.pagination';

export function extractSearchQuery(request): SearchQuery {
    const { query } = request;

    const search: string = query.search || '';

    return {
        search,
    }
}

export function extractOrderingQuery(request, fieldSeparator = '__'): OrderingQuery {
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

export function extractWhereQuery(request, fieldSeparator = '__'): WhereQuery {
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

function buildUrlFromRequest(request) {
    return `${request.protocol}://${request.headers.host}${request.url}`;
}

export function extractPagePaginationQuery(request): PagePaginationQuery {
    const { query } = request;

    return {
        page: query.page ? parseInt(query.page.toString(), 10) : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
        path: buildUrlFromRequest(request),
    }
}

export function extractLimitOffsetPaginationQuery(request): LimitOffsetPaginationQuery {
    const { query } = request;

    return {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
        offset: query.offset ? parseInt(query.offset.toString(), 10) : undefined,
        path: buildUrlFromRequest(request),
    }
}