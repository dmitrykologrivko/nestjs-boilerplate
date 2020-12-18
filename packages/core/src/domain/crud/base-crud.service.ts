import { Repository, SelectQueryBuilder } from 'typeorm';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ClassTransformer } from '../../utils/class-transformer.util';
import { ClassValidator } from '../../utils/validation/class-validator.util';
import { ValidationContainerException } from '../../utils/validation/validation-container.exception';
import { Result, Ok, Err } from '../../utils/monads';
import { EntityNotFoundException } from '../entities/entity-not-found.exception';
import { BaseDomainPermission } from '../permissions/base-domain.permission';
import { PermissionDeniedException } from '../permissions/permission-denied.exception';
import { Identifiable } from '../entities/identifiable.interface';
import { BaseFilter } from '../filters/base.filter';
import { BasePagination } from '../pagination/base.pagination';
import { BasePaginatedContainer } from '../pagination/base-paginated-container.interface';
import { FilterChain } from './filter-chain.util';
import { ListQuery } from './list-query.interface';
import { RetrieveQuery } from './retrieve-query.interface';
import { DestroyQuery } from './destroy-query.interface';
import { CrudOperations } from './crud-operations.enum';

export type IdentifiableObject = object & Identifiable;

export abstract class BaseCrudService<E extends IdentifiableObject, D extends IdentifiableObject> {

    protected constructor(
        protected readonly repository: Repository<E>,
        protected readonly entityCls: ClassType<E>,
        protected readonly dtoCls: ClassType<D>,
    ) {}

    async list<T extends ListQuery, U extends BasePaginatedContainer<D>>(
        input: T
    ): Promise<Result<U, PermissionDeniedException>> {
        if (!this.checkPermissions(input)) {
            return Err(new PermissionDeniedException());
        }

        const queryBuilder = this.getListQuery();

        const chain = FilterChain.create<E>(queryBuilder);

        for (const factory of this.getFilters(input)) {
            chain.addFilter(factory);
        }

        chain.setPagination(this.getPagination(input));

        let output: U;

        if (chain.hasPagination()) {
            output = await chain.mapPaginatedContainer(response => ({
                ...response,
                results: this.mapListDto(response.results),
            })) as U;
        } else {
            output = await chain.reduceEntities(data => ({
                results: this.mapListDto(data),
            })) as U;
        }

        return Ok(output);
    }

    async retrieve<T extends RetrieveQuery>(
        input: T,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException>> {
        if (!this.checkPermissions(input)) {
            return Err(new PermissionDeniedException());
        }

        const entity = await this.getObjectQuery(input.id).getOne();

        if (!entity) {
            return Err(new EntityNotFoundException());
        }

        if (!this.checkEntityPermissions(input, entity)) {
            return Err(new PermissionDeniedException());
        }

        const output = this.mapDtoOutput(entity) as D;

        return Ok(output);
    }

    async create(
        input: D,
    ): Promise<Result<D, PermissionDeniedException | ValidationContainerException>> {
        if (!this.checkPermissions(input)) {
            return Err(new PermissionDeniedException());
        }

        const validateResult = await ClassValidator.validate(
            this.dtoCls,
            input,
            { groups: [CrudOperations.CREATE] },
        );

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        // Transform input to omit fields not related for create operation
        const omittedInput = ClassTransformer.toClassObject(
            this.dtoCls,
            input,
            { groups: [CrudOperations.CREATE] },
        );

        const entity = await this.performCreateEntity(omittedInput);

        const output = this.mapDtoOutput(
            await this.getObjectQuery(entity.id).getOne(),
        ) as D;

        return Ok(output);
    }

    async update(
        input: D,
        partial: boolean = false,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException | ValidationContainerException>> {
        if (!this.checkPermissions(input)) {
            return Err(new PermissionDeniedException());
        }

        let entity = await this.getObjectQuery(input.id).getOne();

        if (!entity) {
            return Err(new EntityNotFoundException());
        }

        if (!this.checkEntityPermissions(input, entity)) {
            return Err(new PermissionDeniedException());
        }

        const groups = partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];

        const validateResult = await ClassValidator.validate(
            this.dtoCls,
            input,
            { groups },
        );

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        // Transform input to omit fields not related for update operation
        const omittedInput = ClassTransformer.toClassObject(
            this.dtoCls,
            input,
            { groups },
        );

        entity = await this.performUpdateEntity(omittedInput, entity);

        const output = this.mapDtoOutput(
            await this.getObjectQuery(entity.id).getOne(),
        ) as D;

        return Ok(output);
    }

    async destroy<T extends DestroyQuery>(
        input: T,
    ): Promise<Result<void, PermissionDeniedException | EntityNotFoundException>> {
        if (!this.checkPermissions(input)) {
            return Err(new PermissionDeniedException());
        }

        const entity = await this.getObjectQuery(input.id).getOne();

        if (!entity) {
            return Err(new EntityNotFoundException());
        }

        if (!this.checkEntityPermissions(input, entity)) {
            return Err(new PermissionDeniedException());
        }

        await this.performDestroyEntity(entity);

        return Ok(null);
    }

    protected async performCreateEntity(input: D): Promise<E> {
        return await this.repository.save(
            ClassTransformer.toClassObject(this.entityCls, input),
        );
    }

    protected async performUpdateEntity(input: D, entity: E): Promise<E> {
        // Typeorm always doing partial update by excluding undefiled fields from input
        return await this.repository.save(
            ClassTransformer.toClassObject(this.entityCls, { ...entity, ...input, id: entity.id }),
        );
    }

    protected async performDestroyEntity(entity: E) {
        await this.repository.remove(entity);
    }

    protected checkPermissions(input: any) {
        for (const permission of this.getPermissions()) {
            const hasPermission = permission.hasPermission(input);

            if (hasPermission !== undefined && !hasPermission) {
                return false;
            }
        }

        return true;
    }

    protected checkEntityPermissions(input: any, entity: E) {
        for (const permission of this.getPermissions()) {
            const hasEntityPermission = permission.hasEntityPermission(input, entity);

            if (hasEntityPermission !== undefined && !hasEntityPermission) {
                return false;
            }
        }

        return true;
    }

    protected getListQuery(): SelectQueryBuilder<E> {
        return this.repository.createQueryBuilder(
            this.repository.metadata.name,
        );
    }

    protected getObjectQuery<T = number>(id: T): SelectQueryBuilder<E> {
        const alias = this.repository.metadata.name;

        return this.repository.createQueryBuilder(alias)
            .where(`${alias}.id = :id`, { id });
    }

    protected getFilters<T extends ListQuery>(
        input: T,
    ): ((qb: SelectQueryBuilder<E>) => BaseFilter<E>)[] {
        return [];
    }

    protected getPagination<T extends ListQuery>(
        input: T,
    ): (qb: SelectQueryBuilder<E>) => BasePagination<E, BasePaginatedContainer<E>> {
        return (qb) => null;
    }

    protected getPermissions(): BaseDomainPermission[] {
        return [];
    }

    protected mapListDto(entities: E[]): D[] {
        return ClassTransformer.toClassObjects(
            this.dtoCls,
            entities,
            { groups: [CrudOperations.READ] },
        );
    }

    protected mapDtoOutput(entity: E): D {
        return ClassTransformer.toClassObject(
            this.dtoCls,
            entity,
            { groups: [CrudOperations.READ] },
        );
    }
}
