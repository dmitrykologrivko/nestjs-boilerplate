import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { BaseFilter } from './base.filter';

export interface SearchQuery {
    search: string;
}

export interface SearchMeta {
    searchFields: string[];
}

export class SearchFilter<E> extends BaseFilter<E> {
    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: SearchQuery,
        protected readonly meta: SearchMeta,
    ) {
        super(queryBuilderOrRepository);

        if (!meta.searchFields || meta.searchFields.length === 0) {
            throw new Error('Must be provided at least one search field!');
        }
    }

    filter(): SelectQueryBuilder<E> {
        if (!this.query.search) {
            return this.queryBuilder;
        }

        const searchFields: string[] = this.meta.searchFields
            .map(this.adaptFieldName.bind(this));

        return this.queryBuilder.andWhere(new Brackets(qb => {
            for (const field of searchFields) {
                const index = this.getParamIndex(field);
                qb.orWhere(`${field} LIKE :${index}`, { [index]: `%${this.query.search}%` });
            }
        }));
    }
}
