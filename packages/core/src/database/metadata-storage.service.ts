import { Injectable } from '@nestjs/common';
import { Metadata } from './database.interfaces';
import { DEFAULT_DATA_SOURCE_NAME } from './database.constants';

@Injectable()
export class MetadataStorageService {

    private static readonly _storage = new Map<string, Metadata[]>();

    static getEntitiesMetadataByDataSource(dataSource: string) {
        return this.getMetadataByDataSource(dataSource)
            .filter(metadata => metadata.type === 'entities');
    }

    static getMigrationsMetadataByDataSource(dataSource: string) {
        return this.getMetadataByDataSource(dataSource)
            .filter(metadata => metadata.type === 'migrations');
    }

    static getMetadataByDataSource(dataSource: string) {
        return this._storage.get(dataSource);
    }

    static addMetadata(metadata: Metadata) {
        const token = metadata.dataSource || DEFAULT_DATA_SOURCE_NAME;
        let collection = this._storage.get(token);

        if (!collection) {
            collection = [];
        }

        collection.push(metadata);

        this._storage.set(token, collection);
    }

    static clear() {
        this._storage.clear();
    }

    static get storage(): Map<string, Metadata[]> {
        return this._storage;
    }

    getEntitiesMetadataByDataSource(dataSource: string) {
        return MetadataStorageService.getEntitiesMetadataByDataSource(dataSource);
    }

    getMigrationsMetadataByDataSource(dataSource: string) {
        return MetadataStorageService.getMigrationsMetadataByDataSource(dataSource);
    }

    getMetadataByDataSource(dataSource: string) {
        return MetadataStorageService.getMetadataByDataSource(dataSource);
    }
}
