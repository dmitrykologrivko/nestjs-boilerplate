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