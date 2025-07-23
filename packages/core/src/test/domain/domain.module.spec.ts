import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainModule } from '../../domain/domin.module';
import { EventBus } from '../../domain/events/event-bus.util';
import { EntityEventsManager } from '../../domain/events/entity-events.manager';

describe('DomainModule (Integration)', () => {
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
                DomainModule,
            ]
        });

        const eventBusService = module.get(EventBus);
        const entityEventsManager = module.get(EntityEventsManager);

        expect(eventBusService).toBeDefined();
        expect(eventBusService).toBeInstanceOf(EventBus);
        expect(entityEventsManager).toBeDefined();
        expect(entityEventsManager).toBeInstanceOf(EntityEventsManager);
    });
});
