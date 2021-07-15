import { SelectQueryBuilder } from 'typeorm';
import { BaseFilter } from './base.filter';
import { BaseWhereQuery, WHERE_LOGICAL_OPERATORS } from '../queries/base-where.query';

export class QueryFilter<E> extends BaseFilter<E> {
    constructor(
        protected qb: SelectQueryBuilder<E>,
        protected queries: [BaseWhereQuery<E>, WHERE_LOGICAL_OPERATORS?][],
    ) {
        super(qb);
    }

    filter(): SelectQueryBuilder<E> {
        this.queries.forEach(item => {
            const query = item[0];
            const logicalOperator = item[1];

            const expression = query.toWhereExpression();
            const where = expression[0];
            const parameters = expression[1];

            if (logicalOperator === WHERE_LOGICAL_OPERATORS.OR) {
                this.queryBuilder.orWhere(where, parameters);
                return;
            }

            this.queryBuilder.andWhere(where, parameters);
        });

        return this.queryBuilder;
    }
}
