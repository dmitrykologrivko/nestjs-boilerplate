import { Repository, SelectQueryBuilder } from 'typeorm'
import { BasePagination } from './base.pagination';
import { PaginatedContainer } from './paginated-container.interface';
import { replaceUrlQueryParam, removeUrlQueryParam } from './pagination.utils';

const LIMIT_QUERY_KEY = 'limit';
const OFFSET_QUERY_KEY = 'offset';

export interface LimitOffsetPaginationQuery {
    limit: number;
    offset: number;
    path: string;
}

export interface LimitOffsetPaginationMeta {
    pageSize?: number;
}

export class LimitOffsetPagination<E> extends BasePagination<E, PaginatedContainer<E>> {

    protected readonly limit: number;

    protected readonly offset: number;

    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: LimitOffsetPaginationQuery,
        protected readonly meta: LimitOffsetPaginationMeta = { pageSize: 100 },
    ) {
        super(queryBuilderOrRepository);
        this.limit = this.query.limit || this.meta.pageSize;
        this.offset = this.query.offset || 0;
    }

    paginate() {
        return this.queryBuilder
            .take(this.limit)
            .skip(this.offset);
    }

    async toPaginatedContainer(): Promise<PaginatedContainer<E>> {
        const queryBuilder = this.paginate();

        const results = await queryBuilder.getRawMany();
        const count = await queryBuilder.getCount();

        let next = replaceUrlQueryParam(this.query.path, LIMIT_QUERY_KEY, this.limit);

        if (this.limit + this.offset < count) {
            next = replaceUrlQueryParam(next, OFFSET_QUERY_KEY, this.limit + this.offset);
        } else {
            next = null;
        }

        let previous = replaceUrlQueryParam(this.query.path, LIMIT_QUERY_KEY, this.limit);

        if (this.offset === 0) {
            previous = null;
        } else if (this.limit > this.offset || this.limit === this.offset) {
            previous = removeUrlQueryParam(previous, OFFSET_QUERY_KEY);
        } else {
            previous = replaceUrlQueryParam(previous, OFFSET_QUERY_KEY, this.offset - this.limit);
        }

        return {
            count,
            next,
            previous,
            results,
        };
    }
}
