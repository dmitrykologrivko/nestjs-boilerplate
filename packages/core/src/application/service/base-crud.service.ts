import { Repository, SelectQueryBuilder } from 'typeorm';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ClassTransformer } from '../../utils/class-transformer.util';
import { ClassValidator } from '../../utils/validation/class-validator.util';
import { ValidationContainerException } from '../../utils/validation/validation-container.exception';
import { AsyncResult, Result, ok, err } from '../../utils/monads';
import { FilterChain } from '../utils/filter-chain.util';
import { BaseEntity } from '../../domain/entities/base.entity';
import { Identifiable } from '../../domain/entities/identifiable.interface';
import { EntityNotFoundException } from '../../domain/entities/entity-not-found.exception';
import { BaseDto } from '../dto/base.dto';
import { BaseEntityDto } from '../dto/base-entity.dto';
import { ListQuery } from '../dto/list-query.interface';
import { RetrieveQuery } from '../dto/retrieve-query.interface';
import { DestroyQuery } from '../dto/destroy-query.interface';
import { CrudOperations } from '../constants/crud-operations.enum';
import { ListInput } from '../dto/list.input';
import { RetrieveInput } from '../dto/retrieve.input';
import { DestroyInput } from '../dto/destroy.input';
import { BaseDomainPermission } from '../../domain/permissions/base-domain.permission';
import { PermissionDeniedException } from '../../domain/permissions/permission-denied.exception';
import { BaseFilter } from '../filters/base.filter';
import { BasePagination } from '../pagination/base.pagination';
import { BasePaginatedContainer } from '../pagination/base-paginated-container.interface';

export interface CrudServiceOptions<E, D, CI, UI> {
    entityCls: ClassType<E>;
    dtoCls: ClassType<D>;
    createInputCls: ClassType<CI>;
    updateInputCls: ClassType<UI>;
    returnShallow?: boolean;
}

export enum InputType {
    LIST_INPUT = 'list_input',
    RETRIEVE_INPUT = 'retrieve_input',
    CREATE_INPUT = 'create_input',
    UPDATE_INPUT = 'update_input',
    DESTROY_INPUT = 'destroy_input',
}

export interface InputWrapper<T = any> {
    type: InputType;
    input: T;
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
        const wrapper = { type: InputType.LIST_INPUT, input };
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(async () => {
                const chain = FilterChain.create<E>(this.getQuery(wrapper));

                // Apply filters
                for (const factory of this.getFilters(input)) {
                    chain.addFilter(factory);
                }

                // Apply pagination
                chain.setPagination(this.getPagination(input));

                let output: PC;

                if (chain.hasPagination()) {
                    output = await chain.mapPaginatedContainer(response => ({
                        ...response,
                        results: this.mapListDto(response.results, input),
                    })) as PC;
                } else {
                    output = await chain.reduceEntities(data => ({
                        results: this.mapListDto(data, input),
                    })) as PC;
                }

                return ok(output);
            })
            .toPromise();
    }

    async retrieve(
        input: RI,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException>> {
        const wrapper = { type: InputType.RETRIEVE_INPUT, input };
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() => this.getObject({ id: input.id }, wrapper))
            .proceed(entity => this.checkEntityPermissions(input, entity))
            .map(entity => this.mapDtoOutput(entity, wrapper) as D)
            .toPromise();
    }

    async create(
        input: CI,
    ): Promise<Result<D, PermissionDeniedException | ValidationContainerException | CE>> {
        const wrapper = { type: InputType.CREATE_INPUT, input };
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() =>
                ClassValidator.validate(
                    this.options.createInputCls,
                    input,
                    { groups: [CrudOperations.CREATE] },
                )
            )
            .proceed(() =>
                this.performCreateEntity(
                    // Transform input to omit fields not related for create operation
                    ClassTransformer.toClassObject(
                        this.options.createInputCls,
                        input,
                        { groups: [CrudOperations.CREATE] },
                    ),
                ),
            )
            .map(async entity => {
                if (!this.options.returnShallow) {
                    entity = (await this.getObject({ id: entity.id }, wrapper)).unwrap();
                }
                return this.mapDtoOutput(entity, wrapper) as D
            })
            .toPromise();
    }

    async update(
        input: UI,
        partial: boolean = false,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException | ValidationContainerException | UE>> {
        const wrapper = { type: InputType.UPDATE_INPUT, input };
        const groups = partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() =>
                ClassValidator.validate(
                    this.options.updateInputCls,
                    input,
                    { groups },
                ),
            )
            .proceed(() => this.getObject({ id: input.id }, wrapper))
            .proceed(entity => this.checkEntityPermissions(input, entity))
            .proceed(entity =>
                this.performUpdateEntity(
                    // Transform input to omit fields not related for update operation
                    ClassTransformer.toClassObject(
                        this.options.updateInputCls,
                        input,
                        { groups },
                    ),
                    // Entity to update
                    entity,
                ),
            )
            .map(async entity => {
                if (!this.options.returnShallow) {
                    entity = (await this.getObject({ id: entity.id }, wrapper)).unwrap();
                }
                return this.mapDtoOutput(entity, wrapper) as D
            })
            .toPromise();
    }

    async destroy(
        input: DI,
    ): Promise<Result<void, PermissionDeniedException | EntityNotFoundException | DE>> {
        const wrapper = { type: InputType.DESTROY_INPUT, input };
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() => this.getObject({ id: input.id }, wrapper))
            .proceed(entity => this.checkEntityPermissions(input, entity))
            .proceed(entity => this.performDestroyEntity(input, entity))
            .toPromise();
    }

    protected async performCreateEntity(input: CI): Promise<Result<E, CE>> {
        const entity = await this.repository.create(
            ClassTransformer.toClassObject(
                this.options.entityCls,
               { ...input, id: null },
            ),
        );
        return ok(await this.repository.save(entity));
    }

    protected async performUpdateEntity(input: UI, entity: E): Promise<Result<E, UE>> {
        // Typeorm always doing partial update by excluding undefiled fields from input
        const updatedEntity = await this.repository.save(
            ClassTransformer.toClassObject(
                this.options.entityCls,
                { ...input, id: entity.id },
            ),
        );
        return ok(this.repository.merge(entity, updatedEntity));
    }

    protected async performDestroyEntity(input: DI, entity: E): Promise<Result<void, DE>> {
        await this.repository.remove(entity);
        return ok(null);
    }

    protected async checkPermissions(
        input: any,
    ): Promise<Result<void, PermissionDeniedException>> {
        for (const permission of this.getPermissions()) {
            const hasPermission = await permission.hasPermission(input);

            if (hasPermission !== undefined && !hasPermission) {
                return err(
                    new PermissionDeniedException(permission.message),
                );
            }
        }

        return ok(null);
    }

    protected async checkEntityPermissions(
        input: any,
        entity: E,
    ): Promise<Result<E, PermissionDeniedException>> {
        for (const permission of this.getPermissions()) {
            const hasEntityPermission = await permission.hasEntityPermission(input, entity);

            if (hasEntityPermission !== undefined && !hasEntityPermission) {
                return err(
                    new PermissionDeniedException(permission.message),
                );
            }
        }

        return ok(entity);
    }

    protected async getObject(
        id: Identifiable,
        wrapper?: InputWrapper,
    ): Promise<Result<E, EntityNotFoundException>> {
        const entity = await this.getQuery(wrapper)
            .andWhere(`${this.alias}.id = :id`, { 'id': id.id })
            .getOne();

        if (entity) {
            return ok(entity);
        } else {
            return err(new EntityNotFoundException());
        }
    }

    protected getQuery(
        wrapper?: InputWrapper,
    ): SelectQueryBuilder<E> {
        return this.repository.createQueryBuilder(this.alias);
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

    protected mapListDto(entities: E[], input?: LI, context?: object): D[] {
        return ClassTransformer.toClassObjects(
            this.options.dtoCls,
            entities.map(value => ({ ...value, context })),
            { groups: [CrudOperations.READ] },
        );
    }

    protected mapDtoOutput(entity: E, input?: InputWrapper, context?: object): D {
        return ClassTransformer.toClassObject(
            this.options.dtoCls,
            { ...entity, context },
            { groups: [CrudOperations.READ] },
        );
    }
}
