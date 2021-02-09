import { Repository, SelectQueryBuilder } from 'typeorm';
import { BasePaginatedContainer } from './base-paginated-container.interface';

export abstract class BasePagination<E, P extends BasePaginatedContainer<E>> {

    protected readonly queryBuilder: SelectQueryBuilder<E>;

    protected constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>
    ) {
        if (queryBuilderOrRepository instanceof Repository) {
            this.queryBuilder = queryBuilderOrRepository.createQueryBuilder(
                queryBuilderOrRepository.metadata.name,
            );
        } else {
            this.queryBuilder = queryBuilderOrRepository;
        }
    }

    abstract paginate(): SelectQueryBuilder<E>;

    async toPaginatedContainer(): Promise<P> {
        return {
            results: await this.queryBuilder.getMany(),
        } as P;
    };
}
