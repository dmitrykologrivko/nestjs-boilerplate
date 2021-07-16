import { Repository, SelectQueryBuilder, QueryRunner,  } from 'typeorm';
import { ClassType } from 'class-transformer/ClassTransformer';
import { BaseRepository } from '../../domain/repository/base.repository';
import { BaseEntity } from '../../domain/entities/base.entity';
import { BaseFindManyQuery } from '../queries/base-find-many.query';
import { BaseWhereQuery, WHERE_LOGICAL_OPERATORS } from '../queries/base-where.query';

export abstract class BaseWritableRepository<E extends BaseEntity, W> extends BaseRepository<E,
    BaseFindManyQuery<W> | [BaseWhereQuery<W>, WHERE_LOGICAL_OPERATORS?][], QueryRunner> {

    protected readonly alias: string;

    constructor(
        protected readonly repository: Repository<W>,
        protected readonly writableCls: ClassType<W>,
    ) {
        super();
        this.alias = repository.metadata.name;
    }

    async find(
        query?: BaseFindManyQuery<W> | [BaseWhereQuery<W>, WHERE_LOGICAL_OPERATORS?][],
        unitOfWork?: QueryRunner,
    ): Promise<E | E[]> {
        if (Array.isArray(query)) {
            const queryBuilder = this.applyWhereQueries(
                this.createQueryBuilder(unitOfWork),
                query,
            );
            return (await queryBuilder.getMany()).map(this.toEntity);
        }

        return (await this.getRepository(unitOfWork).find(query?.toFindManyOptions())).map(this.toEntity);
    }

    async findOne(
        query?: BaseFindManyQuery<W> | [BaseWhereQuery<W>, WHERE_LOGICAL_OPERATORS?][],
        unitOfWork?: QueryRunner,
    ): Promise<E> {
        if (Array.isArray(query)) {
            const queryBuilder = this.applyWhereQueries(
                this.createQueryBuilder(unitOfWork),
                query,
            );
            return this.toEntity(await queryBuilder.getOne());
        }

        return this.toEntity((await this.getRepository(unitOfWork).findOne(query?.toFindManyOptions())));
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

    createQueryBuilder(queryRunner?: QueryRunner) {
        return this.repository.createQueryBuilder(this.alias, queryRunner);
    }

    protected abstract toEntity(writable: W): E;

    protected abstract toWritable(entity: E): W;

    private applyWhereQueries(
        queryBuilder: SelectQueryBuilder<W>,
        query: [BaseWhereQuery<W>, WHERE_LOGICAL_OPERATORS?][],
    ) {
        query.forEach(item => {
            const _query = item[0];
            const logicalOperator = item[1];

            const expression = _query.toWhereExpression();
            const where = expression[0];
            const parameters = expression[1];

            if (logicalOperator === WHERE_LOGICAL_OPERATORS.OR) {
                queryBuilder.orWhere(where, parameters);
                return;
            }

            queryBuilder.andWhere(where, parameters);
        });

        return queryBuilder;
    }

    private getRepository(unitOfWork?: QueryRunner) {
        if (!unitOfWork) {
            return this.repository;
        }
        return unitOfWork.manager.getRepository(this.writableCls);
    }
}
