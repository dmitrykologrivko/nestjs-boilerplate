# Application Services

Application services are used to expose domain logic to the presentation layer. Application services are also known 
as Service Layer, called from the presentation layer using a [DTO (Data Transfer Object)](./dto.md). It uses domain 
objects to perform some specific business logic and returns a DTO back to the presentation layer. The main difference 
between application service and domain service is that domain services hold domain logic whereas application services 
do not. To completely isolate the presentation layer from the domain layer use application services.

## Example

NestJS Boilerplate contains `ApplicationService` decorator to mark your services as application services and in the 
future, it is easy to distinguish them from other types of services.

In the following example, we implemented an application service to perform some business logic to transfer money 
between two accounts.

```typescript
import { DataSource, QueryRunner } from 'typeorm';
import {
    ApplicationService,
    Result,
    ok,
    err,
    proceed,
    ClassValidator,
    ValidationContainerException,
    transaction as unitOfWork,
} from '@nestjs-boilerplate/core';
import { MoneyTransferService } from './money-transfer.service';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { TransactionFailedException } from './transaction-failed.exception';
import { TransferMoneyInput } from './transfer-money.input';
import { TransferMoneyOutput } from './transfer-money.input';

@ApplicationService()
export class MoneyService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly moneyTransferService: MoneyTransferService,
    ) {}
    
    async transferMoney(
        input: TransferMoneyInput,
    ): Promise<Result<TransferMoneyOutput, ValidationContainerException | TransactionFailedException>> {
        const handler = (queryRunner: QueryRunner) => ClassValidator.validate(TransferMoneyInput, input)
            .then(proceed(async () => {
                const accountRepository = queryRunner.manager.getRepository(Account);
                const transactionRepository = queryRunner.manager.getRepository(Transaction);

                const fromAccount = await accountRepository.findOne({ id: input.fromAccountId });
                const toAccount = await accountRepository.findOne({ id: input.toAccountId });

                if (!(fromAccount && toAccount)) {
                    return err(new TransactionFailedException());
                }

                return this.moneyTransferService.transferMoney(
                    fromAccount,
                    toAccount,
                    input.amount,
                ).proceedAsync(async transaction => {
                    await accountRepository.save(fromAccount);
                    await accountRepository.save(toAccount);
                    transaction = await transactionRepository.save(transaction);

                    return ok(
                        TransferMoneyOutput.fromEntity(transaction),
                    );
                });
            }));
        
        return unitOfWork(this.dataSource, handler);
    }
}
```

`TransferMoneyInput` and `TransferMoneyOutput` are DTO classes. They use to not expose entities directly to the 
presentation layer. Input DTO can be validated by using `ClassValidator` util to make sure that we receive 
absolutely valid data. As a result of successful operation, we return mapped output.

It is better to have separated input and output DTOs for each method of application service. The naming rule 
should be as MethodNameInput and MethodNameOutput. Even if your method only takes and returns one parameter, 
it is better to create DTO classes. It is more flexible because you can add more properties later without changing 
the signature of your method or breaking other related logic using the application class. Method can return void if 
there is no return value. You can do not define an input DTO if method does not use any arguments but have in view
that it maybe better to write a simple input DTO class if you plan to extend your method arguments in the future.

Note that this application service method is performed as an **indivisible operation** on data.
([Unit of Work](./unit-of-work.md))

## CRUD Service

NestJS Boilerplate contains application service class which implements basic CRUD operations on entity.
`BaseCrudService` class is generic base class for CRUD operations. This class is extendable, you can override 
functionality or apply new methods. Allowed operations such as: List, Retrieve, Create, Update, Destroy 
are transactional by default. ([Unit of Work](./unit-of-work.md))

In the following example, we implemented a simple CRUD service to operate on notes.

```typescript
import { DataSource } from 'typeorm';
import {
    ApplicationService,
    BaseCrudService,
    InjectRepository,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';

@ApplicationService()
export class NoteService extends BaseCrudService<Note, NoteDto> {
    constructor(
        protected dataSource: DataSource,
    ) {
        super(
            dataSource,
            {
                entityCls: Note,
                listOutputCls: NoteDto,
                retrieveOutputCls: NoteDto,
                createPayloadCls: NoteDto,
                createOutputCls: NoteDto,
                updatePayloadCls: NoteDto,
                updateOutputCls: NoteDto,
            },
        );
    }
}
```

### CRUD Permissions

Using permissions you can check if a current user is granted or denied access to performing some operation. 
You can define list of permission for each CRUD operations.

`getPermissions` method defines a list of global permissions applied to all CRUD operations.\
`getEntityPermissions` method defines a list of entity permissions applied to retrieve, create, update, destroy operations.\
`getReadPermissions` method defines a list of global permissions applied to list and retrieve operations.\
`getReadEntityPermissions` method defines a list of entity permissions applied to retrieve operation.\
`getCreatePermissions` method defines a list of global permissions applied to create operation.\
`getUpdatePermissions` method defines a list of global permissions applied to update operation.\
`getUpdateEntityPermissions` method defines a list of entity permissions applied to update operation.\
`getDestroyPermissions` method defines a list of global permissions applied to destroy operation.\
`getDestroyEntityPermissions` method defines a list of entity permissions applied to destroy operation.

Check the [authorization](./authorization.md) section to get more information about permissions.

### CRUD Filters

Using filters you can perform some predefined queries for ordering, searching, dynamic querying objects etc.

`getFilters` method defines a list of filters that will be applied to list operation.

Check the [filters](./filters.md) section to get more information about filters.

### CRUD Pagination

To paginate a list of objects you can provide a paginator class that implements pagination logic.

`getPagination` method defines a pagination class that will be applied to list operation.

Check the [pagination](./pagination.md) section to get more information about pagination.

### CRUD Events

CRUD service can automatically publish domain events about CRUD operations on the entity, such as:
* EntityCreatingEvent
* EntityCreatedEvent
* EntityUpdatingEvent
* EntityUpdatedEvent
* EntityDestroyingEvent
* EntityDestroyedEvent

If you want to handle such events then you need to create the corresponding event handlers, register them, and also 
inject `EntityEventsManager` class into the CRUD service. This is service optional by default.

Check the [domain events](./domain-events.md) section to get more information about domain events.

### Customize CRUD Service

#### Generic arguments

`BaseCrudService` may receive the following generic arguments:
* Entity
* Entity DTO
* ListInput
* ListOutput
* PaginatedContainer
* RetrieveInput
* RetrieveOutput
* CreatePayload
* CreateInput
* CreateOutput
* UpdatePayload
* UpdateInput
* UpdateOutput
* DestroyInput
* CreateExceptions
* UpdateExceptions
* DestroyExceptions

#### Customizing Input and Output

The following generic arguments using for input and output DTOs per CRUD operation:

| Operation |  Input         | Output             |
| --------- | -------------- | ------------------ |
| List      | ListInput      | PaginatedContainer |
| Retrieve  | RetrieveInput  | RetrieveOutput     |
| Create    | CreateInput    | CreateOutput       |
| Update    | UpdateInput    | UpdateOutput       |
| Destroy   | DestroyInput   | void               |

##### List operation

You can extend `ListInput` class to provide your own implementation of input DTO for the list operation.
The default output list item is Entity DTO class, but you can customize this by providing another DTO class that 
extends `BaseEntityDto` class. If you use pagination you can provide a paginated container class that 
will wrap a list of output items.

Mapping Entity -> Entity DTO happens automatically by using `ClassTransformer` util, but you can override 
`mapListOutput` method to have custom mapping logic.

Do not forget to provide class type of output DTO in CRUD service options as `listOutputCls` parameter.

##### Retrieve operation

You can extend `RetrieveInput` class to provide your own implementation of input DTO for the retrieve operation.
The default retrieve output is Entity DTO class, but you can customize this by providing another DTO class that 
extends `BaseEntityDto` class.

Mapping Entity -> Entity DTO happens automatically by using `ClassTransformer` util, but you can override 
`mapRetrieveOutput` method to have custom mapping logic.

Do not forget to provide class type of output DTO in CRUD service options as `retrieveOutputCls` parameter.

##### Create operation

You can extend `CreateInput` class to provide your own implementation of input DTO for the create operation.
The default create output is Entity DTO class, but you can customize this by providing another DTO class that extends 
`BaseEntityDto` class.

Mapping Entity DTO -> Entity happens automatically by using `ClassTransformer` util, but you can override
`mapCreateInput` method to have custom mapping logic.

Mapping Entity -> Entity DTO happens automatically by using `ClassTransformer` util, but you can override 
`mapCreateOutput` method to have custom mapping logic.

Do not forget to provide class type of output DTO in CRUD service options as `createOutputCls` parameter and input 
payload class type as `createPayloadCls` parameter.

##### Update operation

You can extend `UpdateInput` class to provide your own implementation of input DTO for the update operation.
The default update output is Entity DTO class, but you can customize this by providing another DTO class that extends 
`BaseEntityDto` class.

Mapping Entity DTO -> Entity happens automatically by using `ClassTransformer` util, but you can override
`mapUpdateInput` method to have custom mapping logic.

Mapping Entity -> Entity DTO happens automatically by using `ClassTransformer` util, but you can override 
`mapUpdateOutput` method to have custom mapping logic.

Do not forget to provide class type of output DTO in CRUD service options as `updateOutputCls` parameter 
and input payload class type as `updatePayloadCls` parameter.

##### Destroy operation

You can extend `DestroyInput` class to provide your own implementation of input DTO for the update operation.

#### Overriding CRUD methods

If you want to fully override CRUD operation method you can override one of the following methods: 
`list`, `retrieve`, `create`, `update`, `destroy`.

If you want to override storing entity operation you can override one of the following methods: 
`performCreateEntity`, `performUpdateEntity`, `performDestroyEntity`.

#### Overriding database query

You can provide your own custom database query to get a list of objects or retrieving an object.

Method `getQuery` defines common query.\
Method `getObject` defines query to retrieve an object.
