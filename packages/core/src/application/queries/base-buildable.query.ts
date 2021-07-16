import { SelectQueryBuilder } from 'typeorm';
import { BaseQuery } from '../../domain/queries/base.query';

export interface BaseBuildableQuery<E> extends BaseQuery {

    toQueryBuilder(alias: string, queryBuilder: SelectQueryBuilder<E>): SelectQueryBuilder<E>;

}
