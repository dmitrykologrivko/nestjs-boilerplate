# Unit of Work

When you work with databases in your application, you need to take care of data integrity when it comes to situations 
where something might go wrong, and the data might not be written correctly. This is where transactions come into play. 
A transaction in databases is, in fact, not divisible, an atomic operation on data that transfers them from one state 
to another. So once you carry out a business operation, you need your aggregates to be fully saved or rolled back to its 
original state in case of an error. Unit of Work pattern can help implement this, all of you need is wrap your business 
operation in [application service](./application-services.md) in transaction.

Please check [TypeORM transactions](https://typeorm.io/#/transactions) article to get more information on how implement 
transactions using this ORM.

NestJS Boilerplate includes `transaction` function that wraps TypeORM transaction. This function receives two arguments:
reference to the database connection object and work (handler) function. If handler function returns error result or 
throws an exception then current transaction will be rolled back.