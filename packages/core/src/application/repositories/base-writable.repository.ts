import { Repository, QueryRunner } from 'typeorm';
import { Constructor } from '../../utils/type.utils';
import { BaseRepository } from '../../domain/repository/base.repository';
import { BaseEntity } from '../../domain/entities/base.entity';
import { BaseFindOneQuery } from '../queries/base-find-one.query';
import { BaseFindManyQuery } from '../queries/base-find-many.query';
import { BaseBuildableQuery } from '../queries/base-buildable.query';

export abstract class BaseWritableRepository<E extends BaseEntity, W>
    extends BaseRepository<E, BaseFindOneQuery<W> | BaseFindManyQuery<W> | BaseBuildableQuery<W>, QueryRunner> {

    protected readonly alias: string;

    constructor(
        protected readonly repository: Repository<W>,
        protected readonly writableCls: Constructor<W>,
    ) {
        super();
        this.alias = repository.metadata.name;
    }

    async find(
        query?: BaseFindManyQuery<W> | BaseBuildableQuery<W>,
        unitOfWork?: QueryRunner,
    ): Promise<E | E[]> {
        if (!query) return (await this.getRepository(unitOfWork).find())
            .map((writable: W)=> this.toEntity(writable));

        if ('toQueryBuilder' in query) {
            const queryBuilder = query
                ? (query).toQueryBuilder(this.alias, this.createQueryBuilder(unitOfWork))
                : this.createQueryBuilder(unitOfWork);

            return (await queryBuilder.getMany()).map((writable: W) => this.toEntity(writable));
        }

        return (await this.getRepository(unitOfWork).find((query)?.toFindManyOptions()))
            .map((writable: W) => this.toEntity(writable));
    }

    async findOne(
        query: BaseFindOneQuery<W> | BaseBuildableQuery<W>,
        unitOfWork?: QueryRunner,
    ): Promise<E> {
        if ('toQueryBuilder' in query) {
            const queryBuilder = query
                ? (query).toQueryBuilder(this.alias, this.createQueryBuilder(unitOfWork))
                : this.createQueryBuilder(unitOfWork);

            return this.toEntity((await queryBuilder.getOne()));
        }

        return this.toEntity(
            (await this.getRepository(unitOfWork).findOne((query)?.toFindOneOptions())),
        );
    }

    async save(entity: E | E[], unitOfWork?: QueryRunner): Promise<E | E[]> {
        const writable = Array.isArray(entity)
            ? entity.map((entity: E) => this.toWritable(entity))
            : [this.toWritable(entity)];

        const result = (await this.getRepository(unitOfWork).save(writable))
            .map((writable: W) => this.toEntity(writable));

        return result.length === 1 ? result[0] : result;
    }

    async remove(entity: E | E[], unitOfWork?: QueryRunner) {
        const writable = Array.isArray(entity)
            ? entity.map((entity: E) => this.toWritable(entity))
            : [this.toWritable(entity)];

        const result = (await this.getRepository(unitOfWork).remove(writable))
            .map((writable: W) => this.toEntity(writable));

        return result.length === 1 ? result[0] : result;
    }

    protected createQueryBuilder(queryRunner?: QueryRunner) {
        return this.repository.createQueryBuilder(this.alias, queryRunner);
    }

    protected abstract toEntity(writable: W): E;

    protected abstract toWritable(entity: E): W;

    private getRepository(unitOfWork?: QueryRunner) {
        if (!unitOfWork) {
            return this.repository;
        }
        return unitOfWork.manager.getRepository(this.writableCls);
    }
}
