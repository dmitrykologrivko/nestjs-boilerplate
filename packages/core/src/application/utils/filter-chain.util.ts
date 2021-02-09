import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseFilter } from '../filters/base.filter';
import { BasePagination } from '../pagination/base.pagination';
import { BasePaginatedContainer } from '../pagination/base-paginated-container.interface';

export class FilterChain<E, P extends BasePaginatedContainer<E> = BasePaginatedContainer<E>> {
    protected queryBuilder: SelectQueryBuilder<E>;

    protected filters: BaseFilter<E>[];

    protected pagination: BasePagination<E, P>;

    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
    ) {
        if (queryBuilderOrRepository instanceof Repository) {
            this.queryBuilder = queryBuilderOrRepository.createQueryBuilder(
                queryBuilderOrRepository.metadata.name,
            );
        } else {
            this.queryBuilder = queryBuilderOrRepository;
        }

        this.filters = [];
    }

    static create<E, P extends BasePaginatedContainer<E> = BasePaginatedContainer<E>>(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
    ) {
        return new FilterChain<E, P>(queryBuilderOrRepository);
    }

    addFilter(
        factory: (qb: SelectQueryBuilder<E>) => BaseFilter<E>,
    ): FilterChain<E, P> {
        this.filters.push(factory(this.queryBuilder));
        return this;
    }

    setPagination(
        factory: (qb: SelectQueryBuilder<E>) => BasePagination<E, P>,
    ): FilterChain<E, P> {
        this.pagination = factory(this.queryBuilder);
        return this;
    }

    hasPagination() {
        return !!this.pagination;
    }

    filter(): SelectQueryBuilder<E> {
        for (const filter of this.filters) {
            filter.filter();
        }

        if (this.pagination) {
            this.pagination.paginate();
        }

        return this.queryBuilder;
    }

    async toEntities(): Promise<E[]> {
        return await this.filter().getMany();
    }

    async reduceEntities<U>(factory: (data: E[]) => U): Promise<U> {
        const data = await this.toEntities();
        return factory(data);
    }

    async mapEntities<U>(factory: (data: E[]) => U[]): Promise<U[]> {
        const data = await this.toEntities();
        return factory(data);
    }

    async toPaginatedContainer(): Promise<P> {
        if (!this.pagination) {
            throw new Error('Pagination class does not set!');
        }

        this.filter();

        return await this.pagination.toPaginatedContainer();
    }

    async mapPaginatedContainer<U>(factory: (response: P) => U): Promise<U> {
        const response = await this.toPaginatedContainer();
        return factory(response);
    }
}
