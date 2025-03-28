import { Repository, DataSource, SelectQueryBuilder, QueryRunner } from 'typeorm';
import { ValidatorOptions } from 'class-validator';
import { ClassTransformOptions } from 'class-transformer';
import { transaction } from '../../database/database.utils';
import { Constructor } from '../../utils/type.utils';
import { ClassTransformer } from '../../utils/class-transformer.util';
import { ClassValidator } from '../../utils/validation/class-validator.util';
import { BaseEntity } from '../../domain/entities/base.entity';
import { Identifiable } from '../../domain/entities/identifiable.interface';
import { EntityNotFoundException } from '../../domain/entities/entity-not-found.exception';
import { EntityEventsManager } from '../../domain/events/entity-events.manager';
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
    DI extends DestroyInput = DestroyInput> {

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

    /**
     * List entities
     * @param input ListInput object
     * @throws PermissionDeniedException
     */
    async list(input: LI): Promise<PC> {
        const wrapper = { type: InputType.LIST_INPUT, input };

        await checkPermissions<LI>(input, this.getReadPermissions());

        const queryBuilder = this.getQuery(this.repository.queryRunner, wrapper);

        // Apply filters
        this.getFilters(input, queryBuilder).forEach(filter => filter.filter());

        // Apply pagination
        const pagination = this.getPagination(input, queryBuilder);

        if (pagination) {
            const container = await pagination.toPaginatedContainer();
            return {
                ...container,
                results: await this.mapListOutput(container.results, input, this.repository.queryRunner),
            } as PC;
        }

        const entities = await queryBuilder.getMany();
        return { results: await this.mapListOutput(entities, input, this.repository.queryRunner) } as PC;
    }

    /**
     * Retrieve entity by id
     * @param input RetrieveInput object
     * @throws PermissionDeniedException
     * @throws EntityNotFoundException
     */
    async retrieve(input: RI): Promise<RO> {
        const wrapper = { type: InputType.RETRIEVE_INPUT, input };

        await checkPermissions<RI>(input, this.getReadPermissions());

        const entity = await this.getObject({ id: input.id }, null, wrapper);

        await checkEntityPermissions<RI, E>(input, entity, this.getReadEntityPermissions());

        return this.mapRetrieveOutput(entity, input, this.repository.queryRunner);
    }

    /**
     * Create entity
     * @param input CreateInput object
     * @throws PermissionDeniedException
     * @throws ValidationContainerException
     * @throws EventsFailedException
     */
    async create(input: CI): Promise<CO> {
        const wrapper = { type: InputType.CREATE_INPUT, input };

        const preSaveHook: (...args: any[]) => Promise<void> = this.entityEventsManager
            ? this.entityEventsManager.onCreatingEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(null);

        const postSaveHook: (...args: any[]) => Promise<void> = this.entityEventsManager
            ? this.entityEventsManager.onCreatedEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(null);

        const handler = async (queryRunner: QueryRunner) => {
            await checkPermissions<CI>(input, this.getCreatePermissions());

            await ClassValidator.validate(
                this.options.createPayloadCls,
                input.payload,
                {
                    ...this.getValidatorOptions(),
                    groups: [CrudOperations.CREATE],
                },
            );

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

            await preSaveHook(newEntity, this.options.entityCls, queryRunner);

            let entity = await this.performCreateEntity(input, queryRunner);

            if (!this.options.returnShallow) {
                entity = await this.getObject({ id: entity.id }, queryRunner, wrapper);
            }

            return {
                entity,
                output: await this.mapCreateOutput(entity, input, queryRunner),
            };
        };

        return transaction(this.dataSource, handler)
            .then(async ({ entity, output }) => {
                await postSaveHook(entity, this.options.entityCls);
                return output;
            });
    }

    /**
     * Update entity
     * @param input UpdateInput object
     * @throws PermissionDeniedException
     * @throws EntityNotFoundException
     * @throws ValidationContainerException
     * @throws EventsFailedException
     */
    async update(input: UI): Promise<UO> {
        const wrapper = { type: InputType.UPDATE_INPUT, input };
        const groups = input.partial ? [CrudOperations.PARTIAL_UPDATE] : [CrudOperations.UPDATE];

        const preSaveHook: (...args: any[]) => Promise<void> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatingEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(null);

        const postSaveHook: (...args: any[]) => Promise<void> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatedEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(null);

        const handler = async (queryRunner: QueryRunner) => {
            await checkPermissions<UI>(input, this.getUpdatePermissions());

            let entity = await this.getObject({ id: input.payload.id }, queryRunner, wrapper);

            await checkEntityPermissions<UI, E>(input, entity, this.getUpdateEntityPermissions());

            await ClassValidator.validate(
                this.options.updatePayloadCls,
                input.payload,
                {
                    ...this.getValidatorOptions(),
                    groups,
                },
            );

            // Transform input to omit fields not related for update operation
            input.payload = ClassTransformer.toClassObject(
                this.options.updatePayloadCls,
                input.payload,
                {
                    ...this.getClassTransformOptions(),
                    groups,
                },
            );

            await preSaveHook(entity, this.options.entityCls, queryRunner);

            entity = await this.performUpdateEntity(input, entity, queryRunner);

            if (!this.options.returnShallow) {
                entity = await this.getObject({ id: entity.id }, queryRunner, wrapper);
            }

            return {
                entity,
                output: await this.mapUpdateOutput(entity, input),
            };
        };

        return transaction(this.dataSource, handler)
            .then(async ({ entity, output }) => {
                await postSaveHook(entity, this.options.entityCls);
                return output;
            });
    }

    /**
     * Destroy entity
     * @param input DestroyInput object
     * @throws PermissionDeniedException
     * @throws EntityNotFoundException
     * @throws EventsFailedException
     */
    async destroy(input: DI): Promise<void> {
        const wrapper = { type: InputType.DESTROY_INPUT, input };

        const preDestroyHook: (...args: any[]) => Promise<void> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatingEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(null);

        const postDestroyHook: (...args: any[]) => Promise<void> = this.entityEventsManager
            ? this.entityEventsManager.onUpdatedEntity.bind(this.entityEventsManager)
            : (...args: any[]) => Promise.resolve(null);

        const handler = async (queryRunner: QueryRunner) => {
            await checkPermissions<DI>(input, this.getDestroyPermissions());

            const entity = await this.getObject({ id: input.id }, queryRunner, wrapper);

            await checkEntityPermissions<DI, E>(input, entity, this.getDestroyEntityPermissions());

            await preDestroyHook(entity, this.options.entityCls, queryRunner);

            return this.performDestroyEntity(input, entity, queryRunner);
        };

        return transaction(this.dataSource, handler)
            .then(entity => postDestroyHook(entity, this.options.entityCls));
    }

    /**
     * Perform create entity function
     * @param input CreateInput object
     * @param queryRunner Typeorm query runner
     * @protected
     */
    protected async performCreateEntity(
        input: CI,
        queryRunner: QueryRunner,
    ): Promise<E> {
        const entity = this.repository.create(
            await this.mapCreateInput(input, queryRunner),
        );
        return queryRunner.manager.save(entity);
    }

    /**
     * Perform update entity function
     * @param input UpdateInput object
     * @param entity Entity object
     * @param queryRunner Typeorm query runner
     * @protected
     */
    protected async performUpdateEntity(
        input: UI,
        entity: E,
        queryRunner: QueryRunner,
    ): Promise<E> {
        // Typeorm always doing partial update by excluding undefiled fields from input
        const updatedEntity = await queryRunner.manager.save(
            await this.mapUpdateInput(input, entity, queryRunner),
        );
        return this.repository.merge(entity, updatedEntity);
    }

    /**
     * Perform destroy entity function
     * @param input DestroyInput object
     * @param entity Entity object
     * @param queryRunner Typeorm query runner
     * @protected
     */
    protected async performDestroyEntity(
        input: DI,
        entity: E,
        queryRunner: QueryRunner,
    ): Promise<E> {
        return queryRunner.manager.remove(entity);
    }

    /**
     * Get entity by id
     * @param id entity id
     * @param queryRunner typeorm query runner
     * @param wrapper input wrapper
     * @protected
     * @throws EntityNotFoundException
     */
    protected async getObject(
        id: Identifiable,
        queryRunner?: QueryRunner,
        wrapper?: InputWrapper,
    ): Promise<E> {
        const entity = await this.getQuery(queryRunner, wrapper)
            .andWhere(`${this.alias}.id = :id`, { 'id': id.id })
            .getOne();

        if (!entity) {
            throw new EntityNotFoundException();
        }

        return entity;
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
