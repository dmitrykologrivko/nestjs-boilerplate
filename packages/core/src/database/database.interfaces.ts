import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TFunction } from '../utils/type.utils';

export type DatabaseModuleOptions = TypeOrmModuleOptions;

export interface Metadata {

    /**
     * Type of metadata
     */
    type: 'entities' | 'migrations';

    /**
     * Entities or Migrations class (constructor) objects
     */
    constructors?: TFunction[];

    /**
     * Paths or globs to entity or migration files for using in cli tools
     */
    cli?: string[] | string;

    /**
     * Data source
     */
    dataSource?: string;

}
