import { Property } from '../config/property.interface';
import { DatabaseModuleOptions } from './database.interfaces';

export const DATABASES_PROPERTY: Property<{ [key: string]: DatabaseModuleOptions }> = { path: 'databases' };
export const DEFAULT_DATABASE_PROPERTY: Property<DatabaseModuleOptions> = { path: 'databases.default' };
