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
import { CrudOperations } from '../constants/crud-operations.enum';
import { ListInput } from '../dto/list.input';
import { RetrieveInput } from '../dto/retrieve.input';
import { CreateInput } from '../dto/create.input';
import { UpdateInput } from '../dto/update.input';
import { DestroyInput } from '../dto/destroy.input';
import { BasePermission } from '../permissions/base.permission';
import { BaseEntityPermission } from '../permissions/base-entity.permission';
import { PermissionDeniedException } from '../permissions/permission-denied.exception';
import { checkPermissions, checkEntityPermissions } from '../permissions/permissions.utils';
import { BaseFilter } from '../filters/base.filter';
import { BasePagination } from '../pagination/base.pagination';
import { BasePaginatedContainer } from '../pagination/base-paginated-container.interface';

export interface CrudServiceOptions<E, LO, RO, CP, CO, UP, UO> {
    entityCls: ClassType<E>;
    listOutputCls: ClassType<LO>;
    retrieveOutputCls: ClassType<RO>;
    createPayloadCls: ClassType<CP>;
    createOutputCls: ClassType<CO>;
    updatePayloadCls: ClassType<UP>;
    updateOutputCls: ClassType<UO>;
    returnShallow?: boolean;
}

export enum InputType {
    LIST_INPUT = 'list_input',
    RETRIEVE_INPUT = 'retrieve_input',
    CREATE_INPUT = 'create_input',
    UPDATE_INPUT = 'update_input',
    DESTROY_INPUT = 'destroy_input',
}

export interface InputWrapper<LI, RI, CI, UI, DI> {
    type: InputType;
    input: LI | RI | CI | UI | DI;
}

export abstract class BaseCrudService<E extends object & BaseEntity, D extends BaseEntityDto,
    // List
    LI extends ListInput = ListInput,
    LO extends BaseEntityDto = D,
    PC extends BasePaginatedContainer<LO> = BasePaginatedContainer<LO>,
    // Retrieve
    RI extends RetrieveInput = RetrieveInput,
    RO extends BaseEntityDto = D,
    // Create
    CP extends BaseDto = D,
    CI extends CreateInput<CP> = CreateInput<CP>,
    CO extends BaseEntityDto = D,
    // Update
    UP extends BaseEntityDto = D,
    UI extends UpdateInput<UP> = UpdateInput<UP>,
    UO extends BaseEntityDto = D,
    // Destroy
    DI extends DestroyInput = DestroyInput,
    // Create entity exceptions
    CE = any,
    // Update entity exceptions
    UE = any,
    // Destroy entity exceptions
    DE = any> {

    protected readonly alias: string;

    protected constructor(
        protected readonly repository: Repository<E>,
        protected readonly options: CrudServiceOptions<E, LO, RO, CP, CO, UP, UO>,
    ) {
        this.alias = repository.metadata.name;
    }

    async list(
        input: LI,
    ): Promise<Result<PC, PermissionDeniedException>> {
        const wrapper = { type: InputType.LIST_INPUT, input };
        return AsyncResult.from(checkPermissions<LI>(input, this.getReadPermissions()))
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
                        results: this.mapListOutput(response.results, input),
                    })) as PC;
                } else {
                    output = await chain.reduceEntities(data => ({
                        results: this.mapListOutput(data, input),
                    })) as PC;
                }

                return ok(output);
            })
            .toPromise();
    }

    async retrieve(
        input: RI,
    ): Promise<Result<RO, PermissionDeniedException | EntityNotFoundException>> {
        const wrapper = { type: InputType.RETRIEVE_INPUT, input };
        return AsyncResult.from(checkPermissions<RI>(input, this.getReadPermissions()))
            .proceed(() => this.getObject({ id: input.id }, wrapper))
            .proceed(entity => checkEntityPermissions<RI, E>(input, entity, this.getReadEntityPermissions()))
            .map(entity => this.mapRetrieveOutput(entity, input))
            .toPromise();
    }

    async create(
        input: CI,
    ): Promise<Result<CO, PermissionDeniedException | ValidationContainerException | CE>> {
        const wrapper = { type: InputType.CREATE_INPUT, input };
        return AsyncResult.from(checkPermissions<CI>(input, this.getCreatePermissions()))
            .proceed(() =>
                ClassValidator.validate(
                    this.options.createPayloadCls,
                    input.payload,
                    { groups: [CrudOperations.CREATE] },
                )
            )
            .proceed(async () => {
                // Transform input to omit fields not related for create operation
                input.payload = ClassTransformer.toClassObject(
                    this.options.createPayloadCls,
                    input.payload,
                    { groups: [CrudOperations.CREATE] },
                );
                return this.performCreateEntity(input);
            })
            .map(async entity => {
                if (!this.options.returnShallow) {
                    entity = (await this.getObject({ id: entity.id }, wrapper)).unwrap();
                }
                return this.mapCreateOutput(entity, input);
            })
            .toPromise();
    }

    async update(
        input: UI,
    ): Promise<Result<UO, PermissionDeniedException | EntityNotFoundException | ValidationContainerException | UE>> {
        const wrapper = { type: InputType.UPDATE_INPUT, input };
        const groups = input.partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];
        return AsyncResult.from(checkPermissions<UI>(input, this.getUpdatePermissions()))
            .proceed(() => this.getObject({ id: input.payload.id }, wrapper))
            .proceed(entity => checkEntityPermissions<UI, E>(input, entity, this.getUpdateEntityPermissions()))
            .proceed(async entity =>
                (await ClassValidator.validate(
                    this.options.updatePayloadCls,
                    input.payload,
                    { groups },
                )).map(() => entity),
            )
            .proceed(entity => {
                // Transform input to omit fields not related for update operation
                input.payload = ClassTransformer.toClassObject(
                    this.options.updatePayloadCls,
                    input.payload,
                    { groups },
                );
                return this.performUpdateEntity(input, entity);
            })
            .map(async entity => {
                if (!this.options.returnShallow) {
                    entity = (await this.getObject({ id: entity.id }, wrapper)).unwrap();
                }
                return this.mapUpdateOutput(entity, input);
            })
            .toPromise();
    }

    async destroy(
        input: DI,
    ): Promise<Result<void, PermissionDeniedException | EntityNotFoundException | DE>> {
        const wrapper = { type: InputType.DESTROY_INPUT, input };
        return AsyncResult.from(checkPermissions<DI>(input, this.getDestroyPermissions()))
            .proceed(() => this.getObject({ id: input.id }, wrapper))
            .proceed(entity => checkEntityPermissions<DI, E>(input, entity, this.getDestroyEntityPermissions()))
            .proceed(entity => this.performDestroyEntity(input, entity))
            .toPromise();
    }

    protected async performCreateEntity(input: CI): Promise<Result<E, CE>> {
        const entity = await this.repository.create(
            ClassTransformer.toClassObject(
                this.options.entityCls,
               { ...input.payload, id: null },
            ),
        );
        return ok(await this.repository.save(entity));
    }

    protected async performUpdateEntity(input: UI, entity: E): Promise<Result<E, UE>> {
        // Typeorm always doing partial update by excluding undefiled fields from input
        const updatedEntity = await this.repository.save(
            ClassTransformer.toClassObject(
                this.options.entityCls,
                { ...input.payload, id: entity.id },
            ),
        );
        return ok(this.repository.merge(entity, updatedEntity));
    }

    protected async performDestroyEntity(input: DI, entity: E): Promise<Result<void, DE>> {
        await this.repository.remove(entity);
        return ok(null);
    }

    protected async getObject(
        id: Identifiable,
        wrapper?: InputWrapper<LI, RI, CI, UI, DI>,
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
        wrapper?: InputWrapper<LI, RI, CI, UI, DI>,
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

    protected getPermissions(): BasePermission[] {
        return [];
    }

    protected getEntityPermissions(): BaseEntityPermission[] {
        return [];
    }

    protected getReadPermissions(): BasePermission[] {
        return this.getPermissions();
    }

    protected getReadEntityPermissions(): BaseEntityPermission[] {
        return this.getEntityPermissions();
    }

    protected getCreatePermissions(): BasePermission[] {
        return this.getPermissions();
    }

    protected getUpdatePermissions(): BasePermission[] {
        return this.getPermissions();
    }

    protected getUpdateEntityPermissions(): BaseEntityPermission[] {
        return this.getEntityPermissions();
    }

    protected getDestroyPermissions(): BasePermission[] {
        return this.getPermissions();
    }

    protected getDestroyEntityPermissions(): BaseEntityPermission[] {
        return this.getEntityPermissions();
    }

    protected mapListOutput(
        entities: E[],
        input?: LI,
    ): LO[] {
        return ClassTransformer.toClassObjects(
            this.options.listOutputCls,
            entities,
            { groups: [CrudOperations.READ] },
        );
    }

    protected mapRetrieveOutput(
        entity: E,
        input?: RI,
    ): RO {
        return ClassTransformer.toClassObject(
            this.options.retrieveOutputCls,
            entity,
            { groups: [CrudOperations.READ] },
        );
    }

    protected mapCreateOutput(
        entity: E,
        input?: CI,
    ): CO {
        return ClassTransformer.toClassObject(
            this.options.createOutputCls,
            entity,
            { groups: [CrudOperations.READ] },
        );
    }

    protected mapUpdateOutput(
        entity: E,
        input?: UI,
    ): UO {
        return ClassTransformer.toClassObject(
            this.options.updateOutputCls,
            entity,
            { groups: [CrudOperations.READ] },
        );
    }
}
