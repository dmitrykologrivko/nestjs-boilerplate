import { Repository, QueryRunner } from 'typeorm';
import { ClassType } from 'class-transformer/ClassTransformer';
import { BaseRepository } from '../../domain/repository/base.repository';
import { BaseEntity } from '../../domain/entities/base.entity';
import { BaseFindQuery } from '../queries/base-find.query';
import { BaseBuildableQuery } from '../queries/base-buildable.query';

export abstract class BaseWritableRepository<E extends BaseEntity, W> extends BaseRepository<E,
    BaseFindQuery<W> | BaseBuildableQuery<W>, QueryRunner> {

    protected readonly alias: string;

    constructor(
        protected readonly repository: Repository<W>,
        protected readonly writableCls: ClassType<W>,
    ) {
        super();
        this.alias = repository.metadata.name;
    }

    async find(
        query?: BaseFindQuery<W> | BaseBuildableQuery<W>,
        unitOfWork?: QueryRunner,
    ): Promise<E | E[]> {
        if (Object.keys(query).includes('toQueryBuilder')) {
            const queryBuilder = query
                ? (query as BaseBuildableQuery<W>).toQueryBuilder(this.alias, this.createQueryBuilder(unitOfWork))
                : this.createQueryBuilder(unitOfWork);

            return (await queryBuilder.getMany()).map(this.toEntity);
        }

        return (await this.getRepository(unitOfWork).find((query as BaseFindQuery<W>)?.toFindOptions()))
            .map(this.toEntity);
    }

    async findOne(
        query?: BaseFindQuery<W> | BaseBuildableQuery<W>,
        unitOfWork?: QueryRunner,
    ): Promise<E> {
        if (Object.keys(query).includes('toQueryBuilder')) {
            const queryBuilder = query
                ? (query as BaseBuildableQuery<W>).toQueryBuilder(this.alias, this.createQueryBuilder(unitOfWork))
                : this.createQueryBuilder(unitOfWork);

            return this.toEntity((await queryBuilder.getOne()));
        }

        return this.toEntity(
            (await this.getRepository(unitOfWork).findOne((query as BaseFindQuery<W>)?.toFindOptions())),
        );
    }

    async save(entity: E | E[], unitOfWork?: QueryRunner): Promise<E | E[]> {
        const writable = Array.isArray(entity)
            ? entity.map(this.toWritable)
            : [this.toWritable(entity)];

        const result = (await this.getRepository(unitOfWork).save(writable)).map(this.toEntity);

        return result.length === 1 ? result[0] : result;
    }

    async remove(entity: E | E[], unitOfWork?: QueryRunner) {
        const writable = Array.isArray(entity)
            ? entity.map(this.toWritable)
            : [this.toWritable(entity)];

        const result = (await this.getRepository(unitOfWork).remove(writable)).map(this.toEntity);

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
