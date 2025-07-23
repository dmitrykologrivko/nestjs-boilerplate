## 11.0.0

### Features
* Upgraded to support NestJS v11. Now will be using the same major number versioning as NestJS

### Bug fixes
* Various bug fixes and codebase improvements

### BREAKING CHANGES
* Removed all deprecated methods and classes
* Removed the Result monad to unify the error-handling approach using standard practice of NestJS exceptions

## 0.7.0

### Features
* `mapListOutput`, `mapRetrieveOutput`, `mapCreateOutput`, `mapUpdateOutput` functions in `BaseCrudService` class
now can work with provided queryRunner

## 0.6.0

### Features
* Added `Authorizable` interface to provide authorized user to input
* `ListInput`, `RetriveInput`, `CreateInput`, `UpdateInput`, `DestroyInput` now implementing `Authorizable` interface

### BREAKING CHANGES
* Removed redundant `RetrieveQuery`, `DestroyQuery` interfaces, `RetrieveFilter`, `DestroyFilter` decorators and
`extractRetrieveQuery`, `extractDestroyQuery` functions
* Approach revised and removed `extra` field from `BaseInput`, `UserRecoveredPasswordEvent` classes,
replaced `extra` field in `UserChangedPasswordEvent` class to `token`
* `BasePayloadInput` class replaced with `Payloadable` interface
* `CreateInput` and `UpdateInput` classes replaced extending from `BasePayloadInput` class to implementing
`Payloadable` interface
* `mapListOutput`, `mapRetrieveOutput`, `mapCreateOutput`, `mapUpdateOutput` functions in `BaseCrudService` class marked 
as async functions

### DEPRECATIONS
* `FilterChain` class is marked as deprecated

## 0.5.0

### Features
* Added `getValidatorOptions` and `getClassTransformOptions` to `BaseCrudService` class
* Now `queryRunner` is not required parameter in `getQuery` and `getObject` methods of `BaseCrudService` class
* Added `Queryable` interface to provide query and params objects. `ListQuery` interface and `ListInput` class 
now extends that interface
* Added `unwrapResult` util function to depending on provided result status: unwraps and returns successful result 
or throws failed result. Can be used in places where higher levels do not know how to work with the result object 
and forced to handle exceptions
* `AuthorizedUser` and `BearerToken` decorators now can take request factory function to have an abstraction from 
HTTP Node library

### BREAKING CHANGES
* Removed generic types from `InputWrapper` and in turn added new type `GENERIC_INPUT` to `InputType` enum
as result any input extended from `BaseInput` can be provided to input wrapper
* Protected fields changed to public for `User`, `Group`, `Permission` entities to save possibility use find options
in Typeorm repository.

## 0.4.0

### Bug fixes
* Fixed providing an authorized user to `DestoryInput` in base CRUD controller

### Features
* Added `mapCreateInput` and `mapUpdateInput` functions to base CRUD service
* Added `from` method to `Result` monad class

### DEPRECATIONS
* `AsyncResult` class marked as deprecated. Use `Result` monad class methods instead

### BREAKING CHANGES
* Upgraded peer dependencies `"@nestjs/jwt": "^10.0.1"`, `"passport-jwt": "^4.0.1"`, `"class-validator": "~0.14.0"`
* Required parameter `repository` in constructor of base CRUD service was replaced to `dataSource`
* `BaseCrudController` now export `mapRequest` method as an abstract method which should be implemented in child classes.

## 0.3.1

### Bug fixes
* Fixed running create-ts-index package cli command

## 0.3.0

### Features
* Added support TypeORM CLI commands to revert and show migrations
* Added `isDefined` precondition to check if provided argument is defined

### BREAKING CHANGES
* Upgraded support Nest to v9
* Upgraded support TypeORM to v0.3
* Renamed `connection` to `dataSource` in `DatabaseModule.withEntities` and `DatabaseModule.withMigrations` 
method options
* Renamed argument `connection` to `dataSource` in migrations cli command
* Renamed argument `version` to `versionNumber` in `ApiController` decorator 