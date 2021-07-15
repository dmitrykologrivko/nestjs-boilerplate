# Domain Services

Domain services are used to perform domain operations and business rules. Basically, it contains domain logic which
in turn is everything that is related to business decisions. Domain services are stateless classes and can work on top 
of domain entities and value objects. Eric Evans describes three characteristics of a good service:

* The operation relates to a domain concept that is not a natural part of an Entity or Value Object.
* The interface is defined in terms of other elements of the domain model.
* The operation is stateless.

## Example

NestJS Boilerplate contains `DomainService` decorator to mark your services as domain services and in the future, 
it is easy to distinguish them from other types of services.

```typescript
import {
    DomainService,
    Result,
    ok,
    err,
} from '@nestjs-boilerplate/core';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { TransactionFailedException } from './transaction-failed.exception';

@DomainService()
export class MoneyTransferService {
    
    transferMoney(
        fromAccount: Account,
        toAccount: Account,
        amount: number,
    ): Result<Transaction, TransactionFailedException> {
        if (fromAccount.canDebitAmount(amount)) {
            err(new TransactionFailedException());
        }
        
        fromAccount.debit(amount);
        toAccount.credit(amount);
        
        return ok(
            new Transaction(fromAccount, toAccount, amount),
        );
    }
}
```