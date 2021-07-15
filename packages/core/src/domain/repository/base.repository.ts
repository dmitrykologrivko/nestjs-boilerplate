import { BaseEntity } from '../entities/base.entity';
import { BaseQuery } from '../queries/base.query';

export abstract class BaseRepository<E extends BaseEntity, Q extends BaseQuery, U> {

    abstract async find(query?: Q, unitOfWork?: U): Promise<E | E[]>;

    abstract async findOne(query?: Q, unitOfWork?: U): Promise<E>;

    abstract async save(entity: E | E[], unitOfWork?: U): Promise<E | E[]>;

    abstract async remove(entity: E | E[], unitOfWork?: U): Promise<E | E[]>;

}
