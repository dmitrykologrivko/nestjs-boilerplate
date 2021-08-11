import { BaseEntity } from '../entities/base.entity';
import { BaseQuery } from '../queries/base.query';

export abstract class BaseRepository<E extends BaseEntity, Q extends BaseQuery, U> {

    abstract find(query?: Q, unitOfWork?: U): Promise<E | E[]>;

    abstract findOne(query?: Q, unitOfWork?: U): Promise<E>;

    abstract save(entity: E | E[], unitOfWork?: U): Promise<E | E[]>;

    abstract remove(entity: E | E[], unitOfWork?: U): Promise<E | E[]>;

}
