import { Injectable } from '@nestjs/common';
import { DatabaseConnection, Metadata } from './database.interfaces';
import { DEFAULT_CONNECTION_NAME } from './database.constants';

@Injectable()
export class MetadataStorageService {

    private static readonly storage = new Map<string, Metadata[]>();

    static getEntitiesMetadataByConnection(connection: DatabaseConnection) {
        return this.getMetadataByConnection(connection)
            .filter(metadata => metadata.type === 'entities');
    }

    static getMigrationsMetadataByConnection(connection: DatabaseConnection) {
        return this.getMetadataByConnection(connection)
            .filter(metadata => metadata.type === 'migrations');
    }

    static getMetadataByConnection(connection: DatabaseConnection) {
        const token = this.getConnectionToken(connection);
        return this.storage.get(token);
    }

    static addMetadata(metadata: Metadata) {
        const token = this.getConnectionToken(metadata.connection || DEFAULT_CONNECTION_NAME);
        let collection = this.storage.get(token);

        if (!collection) {
            collection = [];
        }

        collection.push(metadata);

        this.storage.set(token, collection);
    }

    private static getConnectionToken(connection: DatabaseConnection) {
        return typeof connection === 'string' ? connection : connection.name;
    }

    getEntitiesMetadataByConnection(connection: DatabaseConnection) {
        return MetadataStorageService.getEntitiesMetadataByConnection(connection);
    }

    getMigrationsMetadataByConnection(connection: DatabaseConnection) {
        return MetadataStorageService.getMigrationsMetadataByConnection(connection);
    }

    getMetadataByConnection(connection: DatabaseConnection) {
        return MetadataStorageService.getMetadataByConnection(connection);
    }
}
