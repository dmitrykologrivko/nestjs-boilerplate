# Application Services

Application services are used to expose domain logic to the presentation layer. Application services are also known 
as Service Layer, called from the presentation layer using a DTO (Data Transfer Object). It uses domain objects to
perform some specific business logic and returns a DTO back to the presentation layer. The main difference between 
application service and domain service is that domain services hold domain logic whereas application services do not.
To completely isolate the presentation layer from the domain layer use application services.

## Example

NestJS Boilerplate contains `ApplicationService` decorator to mark your services as application services and in the 
future, it is easy to distinguish them from other types of services.

```typescript
import { Connection, QueryRunner } from 'typeorm';
import {
    ApplicationService,
    Result,
    from,
    ok,
    err,
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
        private readonly connection: Connection,
        private readonly moneyTransferService: MoneyTransferService,
    ) {}
    
    async transferMoney(
        input: TransferMoneyInput,
    ): Promise<Result<TransferMoneyOutput, TransactionFailedException>> {
        const handler = async (queryRunner: QueryRunner) => {
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
        }
        
        return unitOfWork(this.connection, handler);
    }
}
```

## CRUD Service

TODO