import { Queryable } from './queryable.interface';
import { OrderingQuery } from '../filters/ordering.filter';
import { SearchQuery } from '../filters/search.filter';
import { WhereQuery } from '../filters/where.filter';
import { PagePaginationQuery } from '../pagination/page.pagination';
import { LimitOffsetPaginationQuery } from '../pagination/limit-offset.pagination';

export interface ListQuery
    extends Queryable,
        OrderingQuery,
        SearchQuery,
        WhereQuery,
        PagePaginationQuery,
        LimitOffsetPaginationQuery {}
