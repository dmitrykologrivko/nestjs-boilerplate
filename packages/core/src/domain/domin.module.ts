import { Module, Global } from '@nestjs/common';
import { EventBus } from './events/event-bus.util';
import { EntityEventsManager } from './events/entity-events.manager';

@Global()
@Module({
    providers: [EventBus, EntityEventsManager],
    exports: [EventBus, EntityEventsManager],
})
export class DomainModule {}
