import { Repository, SelectQueryBuilder } from 'typeorm';
import { BasePagination } from './base.pagination';
import { PaginatedContainer } from './paginated-container.interface';
import { replaceUrlQueryParam, removeUrlQueryParam } from './pagination.utils';

const LIMIT_QUERY_KEY = 'limit';
const PAGE_QUERY_KEY = 'page';

export interface PagePaginationQuery {
    limit: number;
    page: number;
    path: string;
}

export interface PagePaginationMeta {
    pageSize?: number;
}

export class PagePagination<E> extends BasePagination<E, PaginatedContainer<E>> {

    protected readonly page: number;

    protected readonly limit: number;

    protected readonly offset: number;

    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: PagePaginationQuery,
        protected readonly meta: PagePaginationMeta = { pageSize: 100 },
    ) {
        super(queryBuilderOrRepository);
        this.page = this.query.page || 1;
        this.limit = this.query.limit || this.meta.pageSize;
        this.offset = (this.page - 1) * this.limit;
    }

    paginate() {
        return this.queryBuilder
            .take(this.limit)
            .skip(this.offset);
    }

    async toPaginatedContainer(): Promise<PaginatedContainer<E>> {
        const [results, count] = await this.queryBuilder.getManyAndCount();

        let next = replaceUrlQueryParam(this.query.path, LIMIT_QUERY_KEY, this.limit);

        if (this.limit + this.offset < count) {
            next = replaceUrlQueryParam(next, PAGE_QUERY_KEY, this.page + 1);
        } else {
            next = null;
        }

        let previous = replaceUrlQueryParam(this.query.path, LIMIT_QUERY_KEY, this.limit);

        if (this.offset === 0) {
            previous = null;
        } else if (this.limit > this.offset || this.limit === this.offset) {
            previous = removeUrlQueryParam(previous, PAGE_QUERY_KEY);
        } else {
            previous = replaceUrlQueryParam(previous, PAGE_QUERY_KEY, this.page - 1);
        }

        return {
            count,
            next,
            previous,
            results,
        };
    }
}
