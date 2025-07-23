import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServerModule } from '../../server/server.module';
import serverConfig from '../../server/server.config';

describe('ServerModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata) {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    it('should load server config', async () => {
        module = await createTestingModule({
            imports: [
                ServerModule,
            ]
        });

        const config = serverConfig();
        const service = module.get(ConfigService);

        Object.keys(config)
            .forEach((key) => {
                expect(service.get(key)).toEqual(config[key]);
            });
    });
});
