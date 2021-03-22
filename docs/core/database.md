# Database

Although Nest is database agnostic and can integrate with any SQL or NoSQL database. Also, you can choose between
available ORMs for TypeScript. NestJS Boilerplate in turn uses [TypeORM](https://typeorm.io/) out-of-the-box.
Other modules included in the NestJS Boilerplate implemented by using this ORM. TypeORM is the most mature
Object Relational Mapper (ORM) available for TypeScript.

NestJS Boilerplate uses `@nestjs/typeorm` package to integrate with TypeORM. You can read [official documentation](https://docs.nestjs.com/techniques/database#typeorm-integration)
on how to integrate that package by default. Basically database module extends default behaviour of that
package and provides a bit more functionality.

## Database connection

`DatabaseModule` is a common module of the database module itself which allows connecting your database.

You can connect your databases by using `withOptions` method which provides a way to pass array
of `DatabaseModuleOptions` for multiple databases.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';

@Module({
    imports: [
        DatabaseModule.withOptions([{
            type: 'sqlite',
            database: 'database',
            autoLoadEntities: true,
            synchronize: true,
        }]),
    ],
})
export class AppModule {
}
```

Also, you can load database connection options from `ormconfig.json` file
(see [official docs](https://typeorm.io/#/using-ormconfig/using-ormconfigjson)). You need to provide an array of
connection options as the first parameter and `true` as the second parameter of `withOptions` method.
Provided connection options will be merged with the connection options from `ormconfig.json` file.
In the array of connection options each element needs to contain a name of connection option from config file
to have association with it. It can be helpful if you need to provide options that typeorm does not support
placing in the `ormconfig.json` file, for example `retryAttempts` or `autoLoadEntities` options. It can be also
helpful if you want to keep using `ormconfig.json` file.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule, DEFAULT_CONNECTION_NAME } from '@nestjs-boilerplate/core';

@Module({
    imports: [
        DatabaseModule.withOptions(
            [{
                name: DEFAULT_CONNECTION_NAME,
                autoLoadEntities: true
            }],
            true,
        ),
    ],
})
export class AppModule {
}
```

You can connect your databases by using `withConfig` method which provides a way to load `DatabaseModuleOptions`
from defined application config.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule, Property } from '@nestjs-boilerplate/core';

const DEFAULT_DATABASE_PROPERTY: Property<DatabaseModuleOptions> = { path: 'databases.default' };

@Module({
  imports: [
      DatabaseModule.withConfig([
          DEFAULT_DATABASE_PROPERTY,
      ]),
  ],
})
export class AppModule {}
```

**Note**
1. If you use multiple connections then each connection must have named. If name of connection is not provided,
   it will be set to default. If some connections have the same name they will be overridden.
2. Entities and migrations defined by `withEntities` and `withMigrations` methods will be auto-loaded and attached
   to the related database connections.

### Connection options

`DatabaseModuleOptions` has the same type as `TypeOrmModuleOptions`. Naming changed for the common structure
of database module classes. See more information on connection options [here](https://docs.nestjs.com/techniques/database#typeorm-integration).

## Repository pattern

TypeORM supports the repository design pattern, so each entity has its own repository. These repositories can be
obtained from the database connection.

## Entities

To work with entities you have to register them to define which repositories are registered in the current scope.\
Use `withEntities` method to register entity classes.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { User } from './user.entity';

@Module({
  imports: [
      DatabaseModule.withEntities([User]),
  ],
})
export class UserModule {}
```

Now we can inject the UserRepository into the UserService using the @InjectRepository() decorator.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }
}
```

### Exporting entity repositories

If you want to use the repository outside the module then you will need to re-export the providers generated by it.
You can do this by exporting the whole module.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { User } from './user.entity';

@Module({
  imports: [
      DatabaseModule.withEntities([User]),
  ],
  exports: [DatabaseModule],
})
export class UserModule {}
```

### Different database connection

By default, all registered entities thought `withEntities` method will be registered under default database connection.
If you want to use another connection then you need to provide it in the entity options as the second parameter of
`withEntities` method.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { User } from './user.entity';

@Module({
  imports: [
      DatabaseModule.withEntities([User], { connection: 'authConnection' }),
  ],
})
export class UserModule {}
```

### Using entities with database CLI commands

To use entities with database CLI commands (about CLI commands see bellow) you need to register paths or globs
to entity files. You can also provide it in the database config but sometimes it can be helpful to define
it in the module definition level. For example if you develop external package.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { User } from './user.entity';

@Module({
  imports: [
      DatabaseModule.withEntities([User], { cli: __dirname + '/**/*.entity{.ts,.js}' }),
  ],
})
export class UserModule {}
```

### Swapping entities

You can swap entities if you need to replace original entity with a customized version of that entity.
This is a very specific case and should not be applied everywhere.

For example, you develop the external package and want your users to have possibility of customization some entities.
To allow your entity to be swappable you need to enable it on your original entity. To use this feature please
apply `Entity` decorator from `@nestjs-boilerplate/core` package. This decorator has default behaviour
as `Entity` decorator from `typeorm` package but extends it to have extra functionality.

```typescript
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from '@nestjs-boilerplate/core';

@Entity({ swappable: true })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;
    
}
```

To use original entity in external package services please use `InjectRepository` decorator from
`@nestjs-boilerplate/core` package. This decorator has default behaviour as `InjectRepository` decorator
from `typeorm` package but extends it to have extra functionality.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs-boilerplate/core';
import { Repository } from 'typeorm';
import { User } from 'auth';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }
}
```

To use original entity as relation of other entities of the external package please use `getTargetName` function from
`@nestjs-boilerplate/core` package. This function gets an actual name of an entity if it was swapped.

```typescript
import { Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Entity, getTargetName } from '@nestjs-boilerplate/core';
import { CustomUser } from './custom-user.entity';

@Entity()
export class Token {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @ManyToOne(getTargetName(User))
    user: User;

}
```

When the application that uses external package needs to customize original entity, it needs to provide original
entity class as `swap` parameter. To use this feature please apply `Entity` decorator from
`@nestjs-boilerplate/core` package. Note that new added fields must be nullable to not broke external package behavior.

```typescript
import { Column } from 'typeorm';
import { Entity } from '@nestjs-boilerplate/core';
import { User } from 'auth';

@Entity({ swap: User })
export class CustomUser extends User {

    @Column({ nullable: true })
    avatar: string;

}
```

Customized entity can be used in the application without applying extended `Entity`, `InjectRepository` decorators
and `getTargetName` function from `@nestjs-boilerplate/core` package. Otherwise, If you are developing another package
that depends on the original entity, please use them to keep it abstract.

### Child entities

NestJS Boilerplate contains `ChildEntity` decorator to help on implementing entity inheritance
(see more about entity inheritance [here](https://typeorm.io/#/entity-inheritance)). It has the same behaviour as
`ChildEntity` decorator from typeorm.

## Migrations

NestJS Boilerplate proposes an option for automatically loading and registering migrations for the database connection.\
Use `withMigrations` method to register migration classes.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import * as migrations from './migrations';

@Module({
  imports: [
      DatabaseModule.withMigrations(migrations),
  ],
})
export class AppModule {}
```

### Different database connection

By default, all registered migrations thought `withMigrations` method will be registered under default
database connection. If you want to use another connection then you need to provide it in the migrations options
as the second parameter of `withMigrations` method.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import * as migrations from './migrations';

@Module({
  imports: [
      DatabaseModule.withMigrations(migrations, { connection: 'authConnection' }),
  ],
})
export class AppModule {}
```

### Using migrations with database CLI commands

To use migrations with database CLI commands (about CLI commands see bellow) you need to register paths or globs
to migrations files. You can provide it in the database config or define it in the module definition level.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import * as migrations from './migrations';

@Module({
  imports: [
      DatabaseModule.withMigrations(
          migrations,
          { cli: __dirname + '/migrations/[!index]*{.ts,.js}' },
      ),
      DatabaseModule.withConfig(),
  ],
})
export class AppModule {}
```

## Default database

NestJS Boilerplate uses SQLite database by default. So you can easily start working on your project but
please use this database only for testing purposes.

## Database CLI commands

To simplify and extending working with the typeorm cli commands, NestJS Boilerplate contains build-in cli database
commands which wrap and complement typeorm cli commands with functionality of NestJS Boilerplate.

### Create migration

To create a new migration you can run `migrations:create` command and provide a name of a new migration.
(see [official docs](https://typeorm.io/#/migrations/creating-a-new-migration) for reference)

Example:\
`npm run command migrations:create --name=test`

**Required params:**\
`name` name of a new migration.

**Optional params:**\
`connection` name of the database connection. Using `default` as default name if actual value is not provided.\
`destination` destination folder for the migration file.\
`useTypescript` if this flag is provided then ts-node will be used to run original typeorm cli command.
(use this only in development mode) This is can be helpful if you use Webpack bundling.

#### Generate migration

To generate automatic migration you can run `migrations:generate` command.
(see [official docs](https://typeorm.io/#/migrations/generating-migrations) for reference)

Example:\
`npm run command migrations:generate`

**Required params:**\
None

**Optional params:**\
`name` name of a new migration. Default value is `auto`.\
`connection` name of the database connection. Using `default` as default name if actual value is not provided.\
`destination` destination folder for the migration file.\
`useTypescript` if this flag is provided then ts-node will be used to run original typeorm cli command.
(use this only in development mode) This is can be helpful if you use Webpack bundling. 

#### Run migrations

To apply pending migrations you can run `migrations:run` command.
(see [official docs](https://typeorm.io/#/migrations/running-and-reverting-migrations) for reference)

Example:\
`npm run command migrations:run`

**Required params:**\
None

**Optional params:**\
`connection` name of the database connection. Using `default` as default name if actual value is not provided.\

## Webpack integration

If you want to build your application by Webpack into a single bundle then you can face some problems.
Your entities and migrations may not detect by TypeORM if you use paths or globs to your files in the database
connection options. It happens because once bundling is done the original files are built into a single module.
To avoid this you can use build-in option `autoLoadEntities` from the `@nestjs/typeorm` package to automatically
load entities. (see [official docs](https://docs.nestjs.com/techniques/database#auto-load-entities)).
To workaround issue with loading migrations you can for example build them separately.

Fortunately NestJS Boilerplate automatically loads entities by default, and also you can easily load migrations
(see Migrations section above).
