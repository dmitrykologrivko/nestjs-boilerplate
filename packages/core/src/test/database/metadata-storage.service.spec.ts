import { MetadataStorageService } from '../../database/metadata-storage.service';
import { Metadata } from '../../database/database.interfaces';
import { DEFAULT_DATA_SOURCE_NAME } from '../../database/database.constants';

describe('MetadataStorageService', () => {
    beforeEach(() => MetadataStorageService.clear());
    afterEach(() => MetadataStorageService.clear());

    describe('#addMetadata()', () => {
        it('should add metadata to the default data source', () => {
            const metadata: Metadata = { type: 'entities', dataSource: undefined };

            MetadataStorageService.addMetadata(metadata);

            const storedMetadata = MetadataStorageService.getMetadataByDataSource(DEFAULT_DATA_SOURCE_NAME);
            expect(storedMetadata).toEqual([metadata]);
        });

        it('should add metadata to a specific data source', () => {
            const metadata: Metadata = { type: 'migrations', dataSource: 'customDataSource' };

            MetadataStorageService.addMetadata(metadata);

            const storedMetadata = MetadataStorageService.getMetadataByDataSource('customDataSource');
            expect(storedMetadata).toEqual([metadata]);
        });
    });

    describe('#getEntitiesMetadataByDataSource()', () => {
        it('(static) should retrieve entities metadata by data source', () => {
            const metadata1: Metadata = { type: 'entities', dataSource: 'dataSource1' };
            const metadata2: Metadata = { type: 'migrations', dataSource: 'dataSource1' };

            MetadataStorageService.addMetadata(metadata1);
            MetadataStorageService.addMetadata(metadata2);

            const entitiesMetadata = MetadataStorageService.getEntitiesMetadataByDataSource('dataSource1');
            expect(entitiesMetadata).toEqual([metadata1]);
        });

        it('(static) should retrieve migrations metadata by data source', () => {
            const metadata1: Metadata = { type: 'entities', dataSource: 'dataSource1' };
            const metadata2: Metadata = { type: 'migrations', dataSource: 'dataSource1' };

            MetadataStorageService.addMetadata(metadata1);
            MetadataStorageService.addMetadata(metadata2);

            const migrationsMetadata = MetadataStorageService.getMigrationsMetadataByDataSource('dataSource1');
            expect(migrationsMetadata).toEqual([metadata2]);
        });

        it('(static) should return undefined if no metadata exists for a data source', () => {
            const result = MetadataStorageService.getMetadataByDataSource('nonExistentDataSource');
            expect(result).toBeUndefined();
        });

        it('(instance) should retrieve entities metadata by data source', () => {
            const metadata1: Metadata = { type: 'entities', dataSource: 'dataSource1' };
            const metadata2: Metadata = { type: 'migrations', dataSource: 'dataSource1' };

            MetadataStorageService.addMetadata(metadata1);
            MetadataStorageService.addMetadata(metadata2);
            const service = new MetadataStorageService();

            const entitiesMetadata = service.getEntitiesMetadataByDataSource('dataSource1');
            expect(entitiesMetadata).toEqual([metadata1]);
        });

        it('(instance) should retrieve migrations metadata by data source', () => {
            const metadata1: Metadata = { type: 'entities', dataSource: 'dataSource1' };
            const metadata2: Metadata = { type: 'migrations', dataSource: 'dataSource1' };

            MetadataStorageService.addMetadata(metadata1);
            MetadataStorageService.addMetadata(metadata2);
            const service = new MetadataStorageService();

            const migrationsMetadata = service.getMigrationsMetadataByDataSource('dataSource1');
            expect(migrationsMetadata).toEqual([metadata2]);
        });

        it('(instance) should return undefined if no metadata exists for a data source', () => {
            const service = new MetadataStorageService();
            const result = service.getMetadataByDataSource('nonExistentDataSource');
            expect(result).toBeUndefined();
        });
    });

    describe('#clear()', () => {
        it('should clear all stored metadata', () => {
            expect(MetadataStorageService.storage.size).toBe(0);

            MetadataStorageService.addMetadata({ type: 'entities', dataSource: 'dataSource1' });

            expect(MetadataStorageService.storage.size).toBe(1);

            MetadataStorageService.clear();

            expect(MetadataStorageService.storage.size).toBe(0);
        });
    });
});
