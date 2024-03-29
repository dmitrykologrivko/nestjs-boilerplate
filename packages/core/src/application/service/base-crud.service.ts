import { Repository, DataSource, SelectQueryBuilder, QueryRunner } from 'typeorm';
import { ValidatorOptions } from 'class-validator';
import { ClassTransformOptions } from 'class-transformer';
import { transaction } from '../../database/database.utils';
import { TransactionRollbackException } from '../../database/transaction-rollback.exception';
import { Constructor } from '../../utils/type.utils';
import { ClassTransformer } from '../../utils/class-transformer.util';
import { ClassValidator } from '../../utils/validation/class-validator.util';
import { ValidationContainerException } from '../../utils/validation/validation-container.exception';
import {
    Result,
    ok,
    err,
    proceed,
    map,
} from '../../utils/monads';
import { BaseEntity } from '../../domain/entities/base.entity';
import { Identifiable } from '../../domain/entities/identifiable.interface';
import { EntityNotFoundException } from '../../domain/entities/entity-not-found.exception';
import { EntityEventsManager } from '../../domain/events/entity-events.manager';
import { EventsFailedException } from '../../domain/events/events-failed.exception';
import { CrudOperations } from '../constants/crud-operations.enum';
import { BaseDto } from '../dto/base.dto';
import { BaseEntityDto } from '../dto/base-entity.dto';
import { BaseInput } from '../dto/base.input';
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
    entityCls: Constructor<E>;
    listOutputCls: Constructor<LO>;
    retrieveOutputCls: Constructor<RO>;
    createPayloadCls: Constructor<CP>;
    createOutputCls: Constructor<CO>;
    updatePayloadCls: Constructor<UP>;
    updateOutputCls: Constructor<UO>;
    returnShallow?: boolean;
}

export enum InputType {
    LIST_INPUT = 'list_input',
    RETRIEVE_INPUT = 'retrieve_input',
    CREATE_INPUT = 'create_input',
    UPDATE_INPUT = 'update_input',
    DESTROY_INPUT = 'destroy_input',
}

export interface InputWrapper {
    type: string;
    input: BaseInput;
}

type ListResult<PC> = Promise<Result<PC, PermissionDeniedException | TransactionRollbackException>>;

type RetrieveResult<RO> = Promise<Result<RO, PermissionDeniedException | EntityNotFoundException
    | TransactionRollbackException>>;

type CreateResult<CO, CE> = Promise<Result<CO, PermissionDeniedException | ValidationContainerException
    | EventsFailedException | TransactionRollbackException | CE>>;

type UpdateResult<UO, UE> = Promise<Result<UO, PermissionDeniedException | EntityNotFoundException
    | ValidationContainerException | EventsFailedException | TransactionRollbackException | UE>>;

type DestroyResult<DE> = Promise<Result<void, PermissionDeniedException | EntityNotFoundException
    | EventsFailedException | TransactionRollbackException | DE>>;

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

    protected readonly repository: Repository<E>
    protected readonly alias: string;

    protected constructor(
        protected readonly dataSource: DataSource,
        protected readonly options: CrudServiceOptions<E, LO, RO, CP, CO, UP, UO>,
        protected readonly entityEventsManager?: EntityEventsManager<E, QueryRunner>,
    ) {
        this.repository = dataSource.getRepository(options.entityCls);
        this.alias = this.repository.metadata.name;
    }

    async list(input: LI): ListResult<PC> {
        const wrapper = { type: InputType.LIST_INPUT, input };

        const handler = (queryRunner: QueryRunner) => checkPermissions<LI>(input, this.getReadPermissions())
            .then(proceed(async (): Promise<Result<PC, PermissionDeniedException>> => {
                const queryBuilder = this.getQuery(queryRunner, wrapper);

                // Apply filters
                this.getFilters(input, queryBuilder).forEach(filter => filter.filter());

                // Apply pagination
                const pagination = this.getPagination(input, queryBuilder);

                if (pagination) {
                    const container = await pagination.toPaginatedContainer();
                    return ok({
                        ...container,
                        results: await this.mapListOutput(container.results, input, queryRunner),
                    } as PC);
                }

                const entities = await queryBuilder.getMany();
                return ok({ results: await this.mapListOutput(entities, input, queryRunner) } as PC);
            }));

        return transaction(this.dataSource, handler);
    }

    async retrieve(input: RI): RetrieveResult<RO> {
        const wrapper = { type: InputType.RETRIEVE_INPUT, input };

        const handler = (queryRunner: QueryRunner) => checkPermissions<RI>(input, this.getReadPermissions())
            .then(proceed(() => this.getObject({ id: input.id }, null, wrapper)))
            .then(proceed(entity => checkEntityPermissions<RI, E>(input, entity, this.getReadEntityPermissions())))
            .then(map(async entity => this.mapRetrieveOutput(entity, input, queryRunner)));

        return transaction(this.dataSource, handler);
    }

    async create(input: CI): CreateResult<CO, CE> {
        const wrapper = { type: InputType.CREATE_INPUT, input };

        const preSaveHook: (...args: any[]) => Promise<Result<void, EventsFailedException>> = this.entityEventsManager
            ? this.entityEventsManager.onCreatingEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(ok(null));
        const postSaveHook: (...args: any[]) => Promise<Result<void, EventsFailedException>> = this.entityEventsManager
            ? this.entityEventsManager.onCreatedEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(ok(null));

        const handler = (queryRunner: QueryRunner) => checkPermissions<CI>(input, this.getCreatePermissions())
            .then(proceed(() =>
                ClassValidator.validate(
                    this.options.createPayloadCls,
                    input.payload,
                    {
                        ...this.getValidatorOptions(),
                        groups: [CrudOperations.CREATE],
                    },
                )
            ))
            .then(proceed(async () => {
                // Transform input to omit fields not related for create operation
                input.payload = ClassTransformer.toClassObject(
                    this.options.createPayloadCls,
                    input.payload,
                    {
                        ...this.getClassTransformOptions(),
                        groups: [CrudOperations.CREATE],
                    },
                );

                const newEntity = this.repository.create(
                    ClassTransformer.toClassObject(
                        this.options.entityCls,
                        { ...input.payload, id: null },
                        this.getClassTransformOptions(),
                    ),
                );

                return preSaveHook(newEntity, this.options.entityCls, queryRunner)
                    .then(proceed(() => this.performCreateEntity(input, queryRunner)))
                    .then(map(async entity => {
                        if (!this.options.returnShallow) {
                            entity = (await this.getObject({ id: entity.id }, queryRunner, wrapper)).unwrap();
                        }

                        return {
                            entity,
                            output: await this.mapCreateOutput(entity, input, queryRunner),
                        };
                    }));
            }));

        return transaction(this.dataSource, handler)
            .then(proceed(async ({ entity, output }) =>
                (await postSaveHook(entity, this.options.entityCls))
                    .map(() => output),
            ));
    }

    async update(input: UI): UpdateResult<UO, UE> {
        const wrapper = { type: InputType.UPDATE_INPUT, input };
        const groups = input.partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];

        const preSaveHook: (...args: any[]) => Promise<Result<void, EventsFailedException>> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatingEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(ok(null));
        const postSaveHook: (...args: any[]) => Promise<Result<void, EventsFailedException>> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatedEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(ok(null));

        const handler = (queryRunner: QueryRunner) => checkPermissions<UI>(input, this.getUpdatePermissions())
            .then(proceed(() => this.getObject({ id: input.payload.id }, queryRunner, wrapper)))
            .then(proceed(entity => checkEntityPermissions<UI, E>(input, entity, this.getUpdateEntityPermissions())))
            .then(proceed(async entity =>
                (await ClassValidator.validate(
                    this.options.updatePayloadCls,
                    input.payload,
                    {
                        ...this.getValidatorOptions(),
                        groups,
                    },
                )).map(() => entity),
            ))
            .then(proceed(async entity => {
                // Transform input to omit fields not related for update operation
                input.payload = ClassTransformer.toClassObject(
                    this.options.updatePayloadCls,
                    input.payload,
                    {
                        ...this.getClassTransformOptions(),
                        groups,
                    },
                );

                return preSaveHook(entity, this.options.entityCls, queryRunner)
                    .then(proceed(() => this.performUpdateEntity(input, entity, queryRunner)))
                    .then(map(async () => {
                        if (!this.options.returnShallow) {
                            entity = (await this.getObject({ id: entity.id }, queryRunner, wrapper)).unwrap();
                        }

                        return {
                            entity,
                            output: await this.mapUpdateOutput(entity, input),
                        };
                    }));
            }));

        return transaction(this.dataSource, handler)
            .then(proceed(async ({ entity, output }) =>
                (await postSaveHook(entity, this.options.entityCls))
                    .map(() => output),
            ));
    }

    async destroy(input: DI): DestroyResult<DE> {
        const wrapper = { type: InputType.DESTROY_INPUT, input };

        const preDestroyHook: (...args: any[]) => Promise<Result<void, EventsFailedException>> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatingEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(ok(null));
        const postDestroyHook: (...args: any[]) => Promise<Result<void, EventsFailedException>> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatedEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(ok(null));

        const handler = (queryRunner: QueryRunner) => checkPermissions<DI>(input, this.getDestroyPermissions())
            .then(proceed(() => this.getObject({ id: input.id }, queryRunner, wrapper)))
            .then(proceed(entity => checkEntityPermissions<DI, E>(input, entity, this.getDestroyEntityPermissions())))
            .then(proceed(entity => {
                return preDestroyHook(entity, this.options.entityCls, queryRunner)
                    .then(proceed(() => this.performDestroyEntity(input, entity, queryRunner)));
            }));

        return transaction(this.dataSource, handler)
            .then(proceed(entity => postDestroyHook(entity, this.options.entityCls)));
    }

    protected async performCreateEntity(
        input: CI,
        queryRunner: QueryRunner,
    ): Promise<Result<E, CE>> {
        const entity = this.repository.create(
            await this.mapCreateInput(input, queryRunner),
        );
        return ok(await queryRunner.manager.save(entity));
    }

    protected async performUpdateEntity(
        input: UI,
        entity: E,
        queryRunner: QueryRunner,
    ): Promise<Result<E, UE>> {
        // Typeorm always doing partial update by excluding undefiled fields from input
        const updatedEntity = await queryRunner.manager.save(
            await this.mapUpdateInput(input, entity, queryRunner),
        );
        return ok(this.repository.merge(entity, updatedEntity));
    }

    protected async performDestroyEntity(
        input: DI,
        entity: E,
        queryRunner: QueryRunner,
    ): Promise<Result<E, DE>> {
        return ok(await queryRunner.manager.remove(entity));
    }

    protected async getObject(
        id: Identifiable,
        queryRunner?: QueryRunner,
        wrapper?: InputWrapper,
    ): Promise<Result<E, EntityNotFoundException>> {
        const entity = await this.getQuery(queryRunner, wrapper)
            .andWhere(`${this.alias}.id = :id`, { 'id': id.id })
            .getOne();

        if (entity) {
            return ok(entity);
        } else {
            return err(new EntityNotFoundException());
        }
    }

    protected getQuery(
        queryRunner?: QueryRunner,
        wrapper?: InputWrapper,
    ): SelectQueryBuilder<E> {
        return this.repository.createQueryBuilder(this.alias, queryRunner);
    }

    protected getFilters(
        input: LI,
        qb: SelectQueryBuilder<E>,
    ): BaseFilter<E>[] {
        return [];
    }

    protected getPagination(
        input: LI,
        qb: SelectQueryBuilder<E>,
    ): BasePagination<E, BasePaginatedContainer<E>> {
        return null;
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

    protected getValidatorOptions(): ValidatorOptions {
        return {};
    }

    protected getClassTransformOptions(): ClassTransformOptions {
        return {};
    }

    protected async mapListOutput(
        entities: E[],
        input?: LI,
        queryRunner?: QueryRunner,
    ): Promise<LO[]> {
        return ClassTransformer.toClassObjects(
            this.options.listOutputCls,
            entities,
            {
                ...this.getClassTransformOptions(),
                groups: [CrudOperations.READ]
            },
        );
    }

    protected async mapRetrieveOutput(
        entity: E,
        input?: RI,
        queryRunner?: QueryRunner,
    ): Promise<RO> {
        return ClassTransformer.toClassObject(
            this.options.retrieveOutputCls,
            entity,
            {
                ...this.getClassTransformOptions(),
                groups: [CrudOperations.READ],
            },
        );
    }

    protected async mapCreateInput(
        input: CI,
        queryRunner: QueryRunner,
    ): Promise<E> {
        return ClassTransformer.toClassObject(
            this.options.entityCls,
            {
                ...input.payload,
                id: null,
            },
            this.getClassTransformOptions(),
        );
    }

    protected async mapCreateOutput(
        entity: E,
        input?: CI,
        queryRunner?: QueryRunner,
    ): Promise<CO> {
        return ClassTransformer.toClassObject(
            this.options.createOutputCls,
            entity,
            {
                ...this.getClassTransformOptions(),
                groups: [CrudOperations.READ],
            },
        );
    }

    protected async mapUpdateInput(
        input: UI,
        entity: E,
        queryRunner: QueryRunner,
    ): Promise<E> {
        return ClassTransformer.toClassObject(
            this.options.entityCls,
            {
                ...input.payload,
                id: entity.id,
            },
            this.getClassTransformOptions(),
        );
    }

    protected async mapUpdateOutput(
        entity: E,
        input?: UI,
        queryRunner?: QueryRunner,
    ): Promise<UO> {
        return ClassTransformer.toClassObject(
            this.options.updateOutputCls,
            entity,
            {
                ...this.getClassTransformOptions(),
                groups: [CrudOperations.READ],
            },
        );
    }
}
