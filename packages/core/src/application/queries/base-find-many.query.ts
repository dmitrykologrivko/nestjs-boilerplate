import { FindManyOptions } from 'typeorm';
import { BaseQuery } from '../../domain/queries/base.query';

export interface BaseFindManyQuery<E> extends BaseQuery {

    toFindManyOptions(): FindManyOptions<E>;

}
