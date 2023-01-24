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