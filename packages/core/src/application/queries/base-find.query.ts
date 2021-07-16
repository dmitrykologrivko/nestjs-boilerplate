import { FindManyOptions } from 'typeorm';
import { BaseQuery } from '../../domain/queries/base.query';

export interface BaseFindQuery<E> extends BaseQuery {

    toFindOptions(): FindManyOptions<E>;

}
