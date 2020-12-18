import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseFilter } from './base.filter';

type Order = [string, 'ASC' | 'DESC'];

export interface OrderingQuery {
    sortBy: string[];
}

export interface OrderingMeta {
    orderingFields: string[] | Record<string, string>;
    defaultOrdering?: string[];
}

export class OrderingFilter<E> extends BaseFilter<E> {
    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: OrderingQuery,
        protected readonly meta: OrderingMeta,
    ) {
        super(queryBuilderOrRepository);

        if (!meta.orderingFields || meta.orderingFields.length === 0) {
            throw new Error('Must be provided at least one ordering field!');
        }
    }

    filter(): SelectQueryBuilder<E> {
        const ordering: Order[] = this.getOrdering(this.query.sortBy);

        if (ordering.length === 0) {
            const defaultOrdering = this.meta.defaultOrdering && this.meta.defaultOrdering.length > 0
                ? this.meta.defaultOrdering
                : [this.meta.orderingFields[0]];

            ordering.push(...this.getOrdering(defaultOrdering));
        }

        for (const order of ordering) {
            this.queryBuilder.addOrderBy(order[0], order[1]);
        }

        return this.queryBuilder;
    }

    private getOrdering(sortBy: string[] = []): Order[] {
        return sortBy.map(param => {
            const name = param.startsWith('-')
                ? param.substr(1, param.length - 1)
                : param;
            const order = param.startsWith('-')
                ? 'DESC'
                : 'ASC';

            return [name, order] as Order;
        }).filter(order => {
            return Array.isArray(this.meta.orderingFields)
                ? this.meta.orderingFields.includes(order[0])
                : this.meta.orderingFields.hasOwnProperty(order[0]);
        }).map(order => {
            return Array.isArray(this.meta.orderingFields)
                ? [this.adaptFieldName(order[0]), order[1]]
                : [this.adaptFieldName(this.meta.orderingFields[order[0]]), order[1]];
        });
    }
}
