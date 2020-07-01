import { Injectable } from '@nestjs/common';
import { DatabaseConnection, EntityOptions } from './database.interfaces';
import { DEFAULT_CONNECTION_NAME } from './database.constants';

@Injectable()
export class EntityMetadataStorage {

    private static readonly storage = new Map<string, EntityOptions[]>();

    static addEntityOptions(options: EntityOptions) {
        const token = this.getConnectionToken(options.connection || DEFAULT_CONNECTION_NAME);
        let collection = this.storage.get(token);

        if (!collection) {
            collection = [];
        }

        collection.push(options);

        this.storage.set(token, collection);
    }

    static getEntityOptionsByConnection(connection: DatabaseConnection) {
        const token = this.getConnectionToken(connection);
        return this.storage.get(token);
    }

    private static getConnectionToken(connection: DatabaseConnection) {
        return typeof connection === 'string' ? connection : connection.name;
    }

    getEntityOptionsByConnection(connection: DatabaseConnection) {
        return EntityMetadataStorage.getEntityOptionsByConnection(connection);
    }
}
