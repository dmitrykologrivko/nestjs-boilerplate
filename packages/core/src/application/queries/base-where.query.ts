import { SelectQueryBuilder, FindManyOptions, Brackets, ObjectLiteral } from 'typeorm';
import { BaseQuery } from '../../domain/queries/base.query';

export enum WHERE_LOGICAL_OPERATORS {
    AND = 'and',
    OR = 'or',
}

export interface BaseWhereQuery<E> extends BaseQuery {

    toWhereExpression(): [string | Brackets | ((qb: SelectQueryBuilder<E>) => string), ObjectLiteral];

}
