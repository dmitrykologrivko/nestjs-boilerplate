import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type DatabaseModuleOptions = TypeOrmModuleOptions;

export interface Metadata {

    /**
     * Type of metadata
     */
    type: 'entities' | 'migrations';

    /**
     * Entities or Migrations class (constructor) objects
     */
    constructors?: Function[];

    /**
     * Paths or globs to entity or migration files for using in cli tools
     */
    cli?: string[] | string;

    /**
     * Data source
     */
    dataSource?: string;

}
