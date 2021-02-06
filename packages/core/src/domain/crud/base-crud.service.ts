import { Repository, SelectQueryBuilder } from 'typeorm';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ClassTransformer } from '../../utils/class-transformer.util';
import { ClassValidator } from '../../utils/validation/class-validator.util';
import { ValidationContainerException } from '../../utils/validation/validation-container.exception';
import { Result, ok, err } from '../../utils/monads';
import { BaseEntity } from '../entities/base.entity';
import { EntityNotFoundException } from '../entities/entity-not-found.exception';
import { BaseDto } from '../dto/base.dto';
import { BaseEntityDto } from '../dto/base-entity.dto';
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
import { ListInput } from './list.input';
import { RetrieveInput } from './retrieve.input';
import { DestroyInput } from './destroy.input';

interface CrudServiceOptions<E, D, CI, UI> {
    entityCls: ClassType<E>;
    dtoCls: ClassType<D>;
    createInputCls: ClassType<CI>;
    updateInputCls: ClassType<UI>;
}

export abstract class BaseCrudService<E extends object & BaseEntity, D extends BaseEntityDto,
    PC extends BasePaginatedContainer<D> = BasePaginatedContainer<D>,
    LI extends ListQuery = ListInput,
    RI extends RetrieveQuery = RetrieveInput,
    CI extends BaseDto = D,
    UI extends BaseEntityDto = D,
    DI extends DestroyQuery = DestroyInput,
    CE = any,
    UE = any,
    DE = any> {

    protected readonly alias: string;

    protected constructor(
        protected readonly repository: Repository<E>,
        protected readonly options: CrudServiceOptions<E, D, CI, UI>,
    ) {
        this.alias = repository.metadata.name;
    }

    async list(
        input: LI,
    ): Promise<Result<PC, PermissionDeniedException>> {
        if (!this.checkPermissions(input)) {
            return err(new PermissionDeniedException());
        }

        const queryBuilder = this.getListQuery(input);

        const chain = FilterChain.create<E>(queryBuilder);

        for (const factory of this.getFilters(input)) {
            chain.addFilter(factory);
        }

        chain.setPagination(this.getPagination(input));

        let output: PC;

        if (chain.hasPagination()) {
            output = await chain.mapPaginatedContainer(response => ({
                ...response,
                results: this.mapListDto(response.results),
            })) as PC;
        } else {
            output = await chain.reduceEntities(data => ({
                results: this.mapListDto(data),
            })) as PC;
        }

        return ok(output);
    }

    async retrieve(
        input: RI,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException>> {
        if (!this.checkPermissions(input)) {
            return err(new PermissionDeniedException());
        }

        const entity = await this.getRetrieveObjectQuery(input).getOne();

        if (!entity) {
            return err(new EntityNotFoundException());
        }

        if (!this.checkEntityPermissions(input, entity)) {
            return err(new PermissionDeniedException());
        }

        const output = this.mapDtoOutput(entity) as D;

        return ok(output);
    }

    async create(
        input: CI,
    ): Promise<Result<D, PermissionDeniedException | ValidationContainerException | CE>> {
        if (!this.checkPermissions(input)) {
            return err(new PermissionDeniedException());
        }

        const validateResult = await ClassValidator.validate(
            this.options.createInputCls,
            input,
            { groups: [CrudOperations.CREATE] },
        );

        if (validateResult.isErr()) {
            return err(validateResult.unwrapErr());
        }

        // Transform input to omit fields not related for create operation
        const omittedInput = ClassTransformer.toClassObject(
            this.options.createInputCls,
            input,
            { groups: [CrudOperations.CREATE] },
        );

        const createEntityResult = await this.performCreateEntity(omittedInput);

        if (createEntityResult.isErr()) {
            return err(createEntityResult.unwrapErr());
        }

        const entity = createEntityResult.unwrap();

        const output = this.mapDtoOutput(
            await this.getObjectQuery(entity).getOne(),
        ) as D;

        return ok(output);
    }

    async update(
        input: UI,
        partial: boolean = false,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException | ValidationContainerException | UE>> {
        if (!this.checkPermissions(input)) {
            return err(new PermissionDeniedException());
        }

        let entity = await this.getUpdateObjectQuery(input).getOne();

        if (!entity) {
            return err(new EntityNotFoundException());
        }

        if (!this.checkEntityPermissions(input, entity)) {
            return err(new PermissionDeniedException());
        }

        const groups = partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];

        const validateResult = await ClassValidator.validate(
            this.options.updateInputCls,
            input,
            { groups },
        );

        if (validateResult.isErr()) {
            return err(validateResult.unwrapErr());
        }

        // Transform input to omit fields not related for update operation
        const omittedInput = ClassTransformer.toClassObject(
            this.options.updateInputCls,
            input,
            { groups },
        );

        const updateEntityResult = await this.performUpdateEntity(omittedInput, entity);

        if (updateEntityResult.isErr()) {
            return err(updateEntityResult.unwrapErr());
        }

        entity = updateEntityResult.unwrap();

        const output = this.mapDtoOutput(
            await this.getObjectQuery(entity).getOne(),
        ) as D;

        return ok(output);
    }

    async destroy(
        input: DI,
    ): Promise<Result<void, PermissionDeniedException | EntityNotFoundException | DE>> {
        if (!this.checkPermissions(input)) {
            return err(new PermissionDeniedException());
        }

        const entity = await this.getDestroyObjectQuery(input).getOne();

        if (!entity) {
            return err(new EntityNotFoundException());
        }

        if (!this.checkEntityPermissions(input, entity)) {
            return err(new PermissionDeniedException());
        }

        return await this.performDestroyEntity(input, entity);
    }

    protected async performCreateEntity(input: CI): Promise<Result<E, CE>> {
        return ok(
            await this.repository.save(
                ClassTransformer.toClassObject(this.options.entityCls, { ...input, id: null }),
            ),
        );
    }

    protected async performUpdateEntity(input: UI, entity: E): Promise<Result<E, UE>> {
        // Typeorm always doing partial update by excluding undefiled fields from input
        return ok(
            await this.repository.save(
                ClassTransformer.toClassObject(this.options.entityCls, { ...entity, ...input, id: entity.id }),
            ),
        );
    }

    protected async performDestroyEntity(input: DI, entity: E): Promise<Result<void, DE>> {
        await this.repository.remove(entity);
        return ok(null);
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

    protected getQuery(): SelectQueryBuilder<E> {
        return this.repository.createQueryBuilder(this.alias);
    }

    protected getObjectQuery(id: Identifiable): SelectQueryBuilder<E> {
        return this.getQuery()
            .andWhere(`${this.alias}.id = :id`, { 'id': id.id });
    }

    protected getListQuery(input: LI): SelectQueryBuilder<E> {
        return this.getQuery();
    }

    protected getRetrieveObjectQuery(input: RI): SelectQueryBuilder<E> {
        return this.getObjectQuery(input);
    }

    protected getUpdateObjectQuery(input: UI): SelectQueryBuilder<E> {
        return this.getObjectQuery(input);
    }

    protected getDestroyObjectQuery(input: DI): SelectQueryBuilder<E> {
        return this.getObjectQuery(input);
    }

    protected getFilters(
        input: LI,
    ): ((qb: SelectQueryBuilder<E>) => BaseFilter<E>)[] {
        return [];
    }

    protected getPagination(
        input: LI,
    ): (qb: SelectQueryBuilder<E>) => BasePagination<E, BasePaginatedContainer<E>> {
        return (qb) => null;
    }

    protected getPermissions(): BaseDomainPermission[] {
        return [];
    }

    protected mapListDto(entities: E[]): D[] {
        return ClassTransformer.toClassObjects(
            this.options.dtoCls,
            entities,
            { groups: [CrudOperations.READ] },
        );
    }

    protected mapDtoOutput(entity: E): D {
        return ClassTransformer.toClassObject(
            this.options.dtoCls,
            entity,
            { groups: [CrudOperations.READ] },
        );
    }
}
