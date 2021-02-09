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
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(async () => {
                const chain = FilterChain.create<E>(
                    this.getQuery(null, { type: InputType.LIST_INPUT, input }),
                );

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
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() => this.getObject(input, { type: InputType.RETRIEVE_INPUT, input }))
            .map(entity => this.mapDtoOutput(entity, { type: InputType.RETRIEVE_INPUT, input }) as D)
            .toPromise();
    }

    async create(
        input: CI,
    ): Promise<Result<D, PermissionDeniedException | ValidationContainerException | CE>> {
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() =>
                ClassValidator.validate(
                    this.options.createInputCls,
                    input,
                    { groups: [CrudOperations.CREATE] }
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
            .map(async entity =>
                this.mapDtoOutput(
                    this.options.returnShallow
                        ? entity
                        : await this.getQuery(entity, { type: InputType.CREATE_INPUT, input })
                            .getOne(),
                    { type: InputType.CREATE_INPUT, input },
                ) as D,
            )
            .toPromise();
    }

    async update(
        input: UI,
        partial: boolean = false,
    ): Promise<Result<D, PermissionDeniedException | EntityNotFoundException | ValidationContainerException | UE>> {
        const groups = partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() =>
                ClassValidator.validate(
                    this.options.updateInputCls,
                    input,
                    { groups }
                ),
            )
            .proceed(() => this.getObject(input, { type: InputType.UPDATE_INPUT, input })
            )
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
            .map(async entity =>
                this.mapDtoOutput(
                    this.options.returnShallow
                        ? entity
                        : await this.getQuery(input, { type: InputType.UPDATE_INPUT, input })
                            .getOne(),
                    { type: InputType.UPDATE_INPUT, input },
                ) as D,
            )
            .toPromise();
    }

    async destroy(
        input: DI,
    ): Promise<Result<void, PermissionDeniedException | EntityNotFoundException | DE>> {
        return AsyncResult.from(this.checkPermissions(input))
            .proceed(() => this.getObject(input, { type: InputType.DESTROY_INPUT, input }))
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
    ): Promise<Result<void, PermissionDeniedException>> {
        for (const permission of this.getPermissions()) {
            const hasEntityPermission = await permission.hasEntityPermission(input, entity);

            if (hasEntityPermission !== undefined && !hasEntityPermission) {
                return err(
                    new PermissionDeniedException(permission.message),
                );
            }
        }

        return ok(null);
    }

    protected async getObject(
        id: Identifiable,
        wrapper: InputWrapper,
    ): Promise<Result<E, EntityNotFoundException | PermissionDeniedException>> {
        const entity = await this.getQuery(id, wrapper).getOne();
        if (!entity) {
            return err(new EntityNotFoundException());
        }

        const checkEntityPermissionsResult = await this.checkEntityPermissions(wrapper.input, entity);
        if (checkEntityPermissionsResult.isErr()) {
            return err(checkEntityPermissionsResult.unwrapErr());
        }

        return ok(entity);
    }

    protected getQuery(
        id?: Identifiable,
        wrapper?: InputWrapper,
    ): SelectQueryBuilder<E> {
        const qb = this.repository.createQueryBuilder(this.alias);

        if (id) {
            qb.andWhere(`${this.alias}.id = :id`, { 'id': id.id });
        }

        return qb;
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
