import {
    Column,
    DataSource,
    QueryRunner,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ValidationContainerException } from '../../../utils/validation/validation-container.exception';
import { Entity } from '../../../database/entity.decorator';
import { EntityCreatingEvent } from '../../../domain/events/entity-creating.event';
import { EntityCreatedEvent } from '../../../domain/events/entity-created.event';
import { EntityUpdatingEvent } from '../../../domain/events/entity-updating.event';
import { EntityUpdatedEvent } from '../../../domain/events/entity-updated.event';
import { EntityDestroyingEvent } from '../../../domain/events/entity-destroying.event';
import { EntityDestroyedEvent } from '../../../domain/events/entity-destroyed.event';
import { BaseEventHandler } from '../../../domain/events/base-event.handler';
import { EventBus } from '../../../domain/events/event-bus.util';
import { EntityEventsManager } from '../../../domain/events/entity-events.manager';
import { BaseEntity } from '../../../domain/entities/base.entity';
import { Identifiable } from '../../../domain/entities/identifiable.interface';
import { BaseEntityDto } from '../../../application/dto/base-entity.dto';
import { ListInput } from '../../../application/dto/list.input';
import { RetrieveInput } from '../../../application/dto/retrieve.input';
import { CreateInput } from '../../../application/dto/create.input';
import { UpdateInput } from '../../../application/dto/update.input';
import { DestroyInput } from '../../../application/dto/destroy.input';
import { PagePagination } from '../../../application/pagination/page.pagination';
import { PaginatedContainer } from '../../../application/pagination/paginated-container.interface';
import { BaseTypeormEntity } from '../../../application/entities/base-typeorm.entity';
import { BasePermission } from '../../../application/permissions/base.permission';
import { BaseEntityPermission } from '../../../application/permissions/base-entity.permission';
import { BaseFilter } from '../../../application/filters/base.filter';
import { SearchFilter } from '../../../application/filters/search.filter';
import { BaseCrudService } from '../../../application/service/base-crud.service';
import {Note} from "../../../../e2e/database/migrations-src/note.entity";

describe('BaseCrudService (Integration)', () => {
    // tslint:disable-next-line:max-classes-per-file
    @Entity()
    class Note extends BaseTypeormEntity {
        @Column()
        note: string;
    }

    // tslint:disable-next-line:max-classes-per-file
    @Exclude()
    class NoteDto extends BaseEntityDto {
        @IsNotEmpty({ always: true })
        @Expose()
        note: string;
    }

    let note1: Note;
    let note2: Note;
    let isNoteCreatingEventCalled = false;
    let isNoteCreatedEventCalled = false;
    let isNoteUpdatingEventCalled = false;
    let isNoteUpdatedEventCalled = false;
    let isNoteDestroyingEventCalled = false;
    let isNoteDestroyedEventCalled = false;
    const eventBus = new EventBus();
    const eventManager = new EntityEventsManager(eventBus);

    // tslint:disable-next-line:max-classes-per-file
    class NoteCreatingEventHandler extends BaseEventHandler<EntityCreatingEvent<Note>, any> {
        supports(): string[] {
            return [EntityCreatingEvent.getName(Note)];
        }

        async handle(_: EntityCreatingEvent<Note>, __: any): Promise<void> {
            isNoteCreatingEventCalled = true;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class NoteCreatedEventHandler extends BaseEventHandler<EntityCreatedEvent<Note>, any> {
        supports(): string[] {
            return [EntityCreatingEvent.getName(Note)];
        }

        async handle(_: EntityCreatingEvent<Note>, __: any): Promise<void> {
            isNoteCreatedEventCalled = true;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class NoteUpdatingEventHandler extends BaseEventHandler<EntityUpdatingEvent<Note>, any> {
        supports(): string[] {
            return [EntityUpdatingEvent.getName(Note)];
        }

        async handle(_: EntityUpdatingEvent<Note>, __: any): Promise<void> {
            isNoteUpdatingEventCalled = true;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class NoteUpdatedEventHandler extends BaseEventHandler<EntityUpdatedEvent<Note>, any> {
        supports(): string[] {
            return [EntityUpdatedEvent.getName(Note)];
        }

        async handle(_: EntityUpdatedEvent<Note>, __: any): Promise<void> {
            isNoteUpdatedEventCalled = true;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class NoteDestroyingEventHandler extends BaseEventHandler<EntityDestroyingEvent<Note>, any> {
        supports(): string[] {
            return [EntityDestroyingEvent.getName(Note)];
        }

        async handle(_: EntityDestroyingEvent<Note>, __: any): Promise<void> {
            isNoteDestroyingEventCalled = true;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class NoteDestroyedEventHandler extends BaseEventHandler<EntityDestroyedEvent<Note>, any> {
        supports(): string[] {
            return [EntityDestroyedEvent.getName(Note)];
        }

        async handle(_: EntityDestroyedEvent<Note>, __: any): Promise<void> {
            isNoteDestroyedEventCalled = true;
        }
    }

    eventBus.registerHandler(new NoteCreatingEventHandler());
    eventBus.registerHandler(new NoteCreatedEventHandler());
    eventBus.registerHandler(new NoteUpdatingEventHandler());
    eventBus.registerHandler(new NoteUpdatedEventHandler());
    eventBus.registerHandler(new NoteDestroyingEventHandler());
    eventBus.registerHandler(new NoteDestroyedEventHandler());

    // tslint:disable-next-line:max-classes-per-file
    class User implements Identifiable {
        id: number;
        name: string;
        isAdmin: boolean;
    }

    // tslint:disable-next-line:max-classes-per-file
    class OnlyAdminCanReadPermission extends BasePermission {
        constructor() {
            super('Only admin can access this resource');
        }

        async hasPermission(input: ListInput<User>): Promise<boolean> {
            return input.user.isAdmin;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class OnlyAdminCanReadFirstEntityPermission extends BaseEntityPermission {
        constructor() {
            super('You can only access the first entity');
        }

        async hasEntityPermission(input: ListInput<User>, entity: BaseEntity): Promise<boolean> {
            return input.user.isAdmin && entity.id === note1.id;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class OnlyAdminCanWritePermission extends BasePermission {
        constructor() {
            super('Only admin can write to this resource');
        }

        async hasPermission(input: ListInput<User>): Promise<boolean> {
            return input.user.isAdmin;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class OnlyAdminCanWriteFirstEntityPermission extends BaseEntityPermission {
        constructor() {
            super('Only admin can write to this resource');
        }

        async hasEntityPermission(input: ListInput<User>, entity: BaseEntity): Promise<boolean> {
            return input.user.isAdmin && entity.id === note1.id;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class NoteService extends BaseCrudService<Note, NoteDto> {
        private _shouldThrowError = false;

        constructor(
            protected internalDataSource: DataSource,
        ) {
            super(
                internalDataSource,
                {
                    entityCls: Note,
                    listOutputCls: NoteDto,
                    retrieveOutputCls: NoteDto,
                    createPayloadCls: NoteDto,
                    createOutputCls: NoteDto,
                    updatePayloadCls: NoteDto,
                    updateOutputCls: NoteDto,
                },
                eventManager
            );
        }

        protected getFilters(input: ListInput, qb: SelectQueryBuilder<Note>): BaseFilter<Note>[] {
            return [new SearchFilter(qb, input, { searchFields: ['note'] })];
        }

        protected getPagination(input: ListInput, qb: SelectQueryBuilder<Note>): PagePagination<Note> {
            return new PagePagination(qb, input);
        }

        protected getReadPermissions(): BasePermission[] {
            return [new OnlyAdminCanReadPermission()];
        }

        protected getReadEntityPermissions(): BaseEntityPermission[] {
            return [new OnlyAdminCanReadFirstEntityPermission()];
        }

        protected getCreatePermissions(): BasePermission[] {
            return [new OnlyAdminCanWritePermission()];
        }

        protected getUpdatePermissions(): BasePermission[] {
            return [new OnlyAdminCanWritePermission()];
        }

        protected getUpdateEntityPermissions(): BaseEntityPermission[] {
            return [new OnlyAdminCanWriteFirstEntityPermission()];
        }

        protected getDestroyPermissions(): BasePermission[] {
            return [new OnlyAdminCanWritePermission()];
        }

        protected getDestroyEntityPermissions(): BaseEntityPermission[] {
            return [new OnlyAdminCanWriteFirstEntityPermission()];
        }

        protected async performCreateEntity(
            input: CreateInput<NoteDto>,
            queryRunner: QueryRunner,
        ): Promise<Note> {
            if (this._shouldThrowError) {
                throw new Error('Transaction failed');
            }
            return super.performCreateEntity(input, queryRunner);
        }

        protected async performUpdateEntity(
            input: UpdateInput<NoteDto>,
            entity: Note,
            queryRunner: QueryRunner,
        ): Promise<Note> {
            if (this._shouldThrowError) {
                throw new Error('Transaction failed');
            }
            return super.performUpdateEntity(input, entity, queryRunner);
        }

        protected async performDestroyEntity(
            input: DestroyInput,
            entity: Note,
            queryRunner: QueryRunner,
        ): Promise<Note> {
            if (this._shouldThrowError) {
                throw new Error('Transaction failed');
            }
            return super.performDestroyEntity(input, entity, queryRunner);
        }

        shouldFailTransaction(): void {
            this._shouldThrowError = true;
        }
    }

    let regularUser: User;
    let adminUser: User;
    let dataSource: DataSource;
    let noteRepository: Repository<Note>;
    let service: NoteService;

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [Note],
        });
        await dataSource.initialize();

        noteRepository = dataSource.getRepository(Note);

        adminUser = new User();
        adminUser.id = 1;
        adminUser.name = 'admin';
        adminUser.isAdmin = true;

        regularUser = new User();
        regularUser.id = 2;
        regularUser.name = 'user';
        regularUser.isAdmin = false;
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        service = new NoteService(dataSource);

        note1 = new Note();
        note1.note = 'Note 1';
        note1 = await noteRepository.save(note1);

        note2 = new Note();
        note2.note = 'Note 2';
        note2 = await noteRepository.save(note2);

        isNoteCreatingEventCalled = false;
        isNoteCreatedEventCalled = false;
        isNoteUpdatingEventCalled = false;
        isNoteUpdatedEventCalled = false;
        isNoteDestroyingEventCalled = false;
        isNoteDestroyedEventCalled = false;
    });

    afterEach(async () => {
        await noteRepository.clear();
    });

    describe('#list()', () => {
        it('should throw error for non admin access', async () => {
            const input = new ListInput<User>();
            input.user = regularUser;

            try {
                await service.list(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can access this resource');
            }
        });

        it('should return a list of entities', async () => {
            const input = new ListInput<User>();
            input.user = adminUser;

            const result = await service.list(input);

            expect(result.results.length).toBe(2);
        });

        it('should return a filtered and paginated list of entities', async () => {
            const input = new ListInput<User>();
            input.page = 1;
            input.limit = 10;
            input.search = 'Note 1';
            input.user = adminUser;

            const result: PaginatedContainer<NoteDto> = await service.list(input) as PaginatedContainer<NoteDto>;

            expect(result.count).toBe(1);
            expect(result.next).toBeNull();
            expect(result.previous).toBeNull();
            expect(result.results.length).toBe(1);
            expect(result.results[0].note).toBe(note1.note);
        });
    });

    describe('#retrieve()', () => {
        it('should throw error for non admin access', async () => {
            const input = new RetrieveInput<number, User>();
            input.id = note1.id;
            input.user = regularUser;

            try {
                await service.retrieve(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can access this resource');
            }
        });

        it('should throw error for non accessible entity', async () => {
            const input = new RetrieveInput<number, User>();
            input.id = note2.id;
            input.user = adminUser;

            try {
                await service.retrieve(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('You can only access the first entity');
            }
        });

        it('should return an entity', async () => {
            const input = new RetrieveInput<number, User>();
            input.id = note1.id;
            input.user = adminUser;

            const result = await service.retrieve(input);

            expect(result.id).toBe(note1.id);
            expect(result.note).toBe(note1.note);
        });
    });

    describe('#create()', () => {
        it('should throw error for non admin access', async () => {
            const input = new CreateInput<NoteDto, User>();
            input.payload = { note: 'New Note' } as NoteDto;
            input.user = regularUser;

            try {
                await service.create(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can write to this resource');
            }
        });

        it('should throw validation error', async () => {
            const input = new CreateInput<NoteDto, User>();
            input.payload = { note: '' } as NoteDto;
            input.user = adminUser;

            try {
                await service.create(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e).toBeInstanceOf(ValidationContainerException);
                expect((e as ValidationContainerException).validationExceptions.length).toBe(1);
                expect((e as ValidationContainerException).validationExceptions[0].property).toBe('note');
                expect((e as ValidationContainerException).validationExceptions[0].value).toBe('');
                expect((e as ValidationContainerException).validationExceptions[0].children.length).toBe(0);
                expect((e as ValidationContainerException).validationExceptions[0].constraints.isNotEmpty)
                    .toBe('note should not be empty');
            }
        });

        it('should rollback transaction', async () => {
            const input = new CreateInput<NoteDto, User>();
            input.payload = { note: 'New Note' } as NoteDto;
            input.user = adminUser;

            expect(await noteRepository.count()).toBe(2);

            try {
                service.shouldFailTransaction();
                await service.create(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Transaction failed');
            }

            expect(await noteRepository.count()).toBe(2);
        });

        it('should create entity', async () => {
            const input = new CreateInput<NoteDto, User>();
            input.payload = { note: 'New Note' } as NoteDto;
            input.user = adminUser;

            const newNote = await service.create(input);

            expect(newNote).toBeDefined();
            expect(newNote.id).toBeDefined();
            expect(newNote.note).toBe('New Note');
        });

        it('should create entity and call events', async () => {
            const input = new CreateInput<NoteDto, User>();
            input.payload = { note: 'New Note' } as NoteDto;
            input.user = adminUser;

            expect(isNoteCreatingEventCalled).toBe(false);
            expect(isNoteCreatedEventCalled).toBe(false);

            const newNote = await service.create(input);

            expect(isNoteCreatingEventCalled).toBe(true);
            expect(isNoteCreatedEventCalled).toBe(true);

            expect(newNote).toBeDefined();
            expect(newNote.id).toBeDefined();
            expect(newNote.note).toBe('New Note');
        });
    });

    describe('#update()', () => {
        it('should throw error for non admin access', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note1.id, note: 'Updated Note' } as NoteDto;
            input.user = regularUser;

            try {
                await service.update(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can write to this resource');
            }
        });

        it('should throw error for non accessible entity', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note2.id, note: 'Updated Note' } as NoteDto;
            input.user = adminUser;

            try {
                await service.update(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can write to this resource');
            }
        });

        it('should throw validation error', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note1.id, note: '' } as NoteDto;
            input.user = adminUser;

            try {
                await service.update(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e).toBeInstanceOf(ValidationContainerException);
                expect((e as ValidationContainerException).validationExceptions.length).toBe(1);
                expect((e as ValidationContainerException).validationExceptions[0].property).toBe('note');
                expect((e as ValidationContainerException).validationExceptions[0].value).toBe('');
                expect((e as ValidationContainerException).validationExceptions[0].children.length).toBe(0);
                expect((e as ValidationContainerException).validationExceptions[0].constraints.isNotEmpty)
                    .toBe('note should not be empty');
            }
        });

        it('should rollback transaction', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note1.id, note: 'Updated Note' } as NoteDto;
            input.user = adminUser;

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe(note1.note);

            try {
                service.shouldFailTransaction();
                await service.update(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Transaction failed');
            }

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe(note1.note);
        });

        it('should update entity', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note1.id, note: 'Updated Note' } as NoteDto;
            input.user = adminUser;

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe(note1.note);

            await service.update(input);

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe('Updated Note');
        });

        it('should update entity when partial update', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note1.id, note: 'Updated Note' } as NoteDto;
            input.partial = true;
            input.user = adminUser;

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe(note1.note);

            const updatedNote = await service.update(input);

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe('Updated Note');

            expect(updatedNote.id).toBe(note1.id);
            expect(updatedNote.note).toBe('Updated Note');
        });

        it('should update entity and call events', async () => {
            const input = new UpdateInput<NoteDto, User>();
            input.payload = { id: note1.id, note: 'Updated Note' } as NoteDto;
            input.user = adminUser;

            expect(isNoteUpdatingEventCalled).toBe(false);
            expect(isNoteUpdatedEventCalled).toBe(false);

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe(note1.note);

            const updatedNote = await service.update(input);

            expect(isNoteUpdatingEventCalled).toBe(true);
            expect(isNoteUpdatedEventCalled).toBe(true);

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote.note).toBe('Updated Note');

            expect(updatedNote.id).toBe(note1.id);
            expect(updatedNote.note).toBe('Updated Note');
        });
    });

    describe('#destroy()', () => {
        it('should throw error for non admin access', async () => {
            const input = new DestroyInput<number, User>();
            input.id = note1.id;
            input.user = regularUser;

            try {
                await service.destroy(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can write to this resource');
            }
        });

        it('should throw error for non accessible entity', async () => {
            const input = new DestroyInput<number, User>();
            input.id = note2.id;
            input.user = adminUser;

            try {
                await service.destroy(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Only admin can write to this resource');
            }
        });

        it('should rollback transaction', async () => {
            const input = new DestroyInput<number, User>();
            input.id = note1.id;
            input.user = adminUser;

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote).toBeDefined();

            try {
                service.shouldFailTransaction();
                await service.destroy(input);
                fail('Expected error to be thrown');
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.message).toBe('Transaction failed');
            }

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote).toBeDefined();
        });

        it('should destroy entity', async () => {
            const input = new DestroyInput<number, User>();
            input.id = note1.id;
            input.user = adminUser;

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote).toBeDefined();

            await service.destroy(input);

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote).toBeNull();
        });

        it('should destroy entity and call events', async () => {
            const input = new DestroyInput<number, User>();
            input.id = note1.id;
            input.user = adminUser;

            expect(isNoteDestroyingEventCalled).toBe(false);
            expect(isNoteDestroyedEventCalled).toBe(false);

            let firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote).toBeDefined();

            await service.destroy(input);

            expect(isNoteDestroyingEventCalled).toBe(true);
            expect(isNoteDestroyedEventCalled).toBe(true);

            firstNote = await noteRepository.findOne({ where: { id: note1.id } });
            expect(firstNote).toBeNull();
        });
    });
});
