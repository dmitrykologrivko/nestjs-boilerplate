import { Connection, ConnectionOptions } from 'typeorm';

export type DatabaseConnection = Connection | ConnectionOptions | string;

export interface EntityOptions {

    /**
     * Entity class (constructor) objects
     */
    entities?: Function[];

    /**
     * Migrations class (constructor) objects
     */
    migrations?: Function[];

    cli?: {
        entities?: string[] | string;
        migrations?: string[] | string;
    };

    /**
     * Database connection
     */
    connection?: DatabaseConnection;
}
