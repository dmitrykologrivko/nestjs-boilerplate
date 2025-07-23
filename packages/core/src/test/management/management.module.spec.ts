import { ModuleMetadata } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Test, TestingModule } from '@nestjs/testing';
import { ManagementModule } from '../../management/management.module';
import { ManagementService } from '../../management/management.service';
import { CommandsScanner } from '../../management/commands-scanner';

describe('ManagementModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata) {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    it('should register services in the module', async () => {
        module = await createTestingModule({
            imports: [
                ManagementModule,
            ]
        });

        const metadataScanner = module.get(MetadataScanner);
        const managementService = module.get(ManagementService);
        const commandsScanner = module.get(CommandsScanner);

        expect(metadataScanner).toBeDefined();
        expect(metadataScanner).toBeInstanceOf(MetadataScanner);
        expect(managementService).toBeDefined();
        expect(managementService).toBeInstanceOf(ManagementService);
        expect(commandsScanner).toBeDefined();
        expect(commandsScanner).toBeInstanceOf(CommandsScanner);
    });
});
