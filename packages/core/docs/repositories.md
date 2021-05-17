# Repositories

The Repository pattern is a facade for data access. Repository implements a mechanism for storing, retrieving, and
searching for objects in a data source. "Mediates between the domain and data mapping layers using a collection-like 
interface for accessing domain objects" (Martin Fowler).

In practice, repositories are used to perform database operations for domain objects (Entity and Value types).
Should separate repositories for each Entity or Aggregate Root.

NestJS Boilerplate is not designed to be independent of a particular ORM or another technique to access a database.
It uses [TypeORM](https://typeorm.io/#/) out-of-the-box, most parts of framework uses the power of this ORM. 
TypeORM has implementation of [repository](https://typeorm.io/#/working-with-repository) pattern for basic 
CRUD operations and allows to create a custom repositories.