import { FindOneOptions } from 'typeorm';
import { BaseQuery } from '../../domain/queries/base.query';

export interface BaseFindOneQuery<E> extends BaseQuery {

    toFindOneOptions(): FindOneOptions<E>;

}
