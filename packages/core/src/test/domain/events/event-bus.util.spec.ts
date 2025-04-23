import { MockProxy, mock } from 'jest-mock-extended';
import { EventBus } from '../../../domain/events/event-bus.util';
import { BaseEvent } from '../../../domain/events/base.event';
import { BaseEventHandler } from '../../../domain/events/base-event.handler';
import { EventFailedException } from '../../../domain/events/event-failed.exception';
import { EventsFailedException } from '../../../domain/events/events-failed.exception';

describe('EventBus', () => {
    class TestEvent extends BaseEvent {
        constructor() {
            super(TestEvent.name);
        }
    }

    let eventBus: EventBus;
    let event: TestEvent;
    let handler: MockProxy<BaseEventHandler<TestEvent, any>>;

    beforeEach(() => {
        eventBus = new EventBus();
        event = new TestEvent();
        handler = mock<BaseEventHandler<TestEvent, any>>();

        handler.supports.mockReturnValue([TestEvent.name]);
        handler.handle.mockResolvedValue(undefined);
    });

    describe('#registerHandler()', () => {
        it('should register a handler', () => {
            eventBus.registerHandler(handler);
            expect(eventBus.handlers).toContain(handler);
        });
    });

    describe('#unregisterHandler()', () => {
        it('should unregister a handler', () => {
            eventBus.registerHandler(handler);
            expect(eventBus.handlers).toContain(handler);

            eventBus.unregisterHandler(handler);
            expect(eventBus.handlers).not.toContain(handler);
        });
    });

    describe('#unregisterAll()', () => {
        it('should unregister all handlers', () => {
            eventBus.registerHandler(handler);
            expect(eventBus.handlers).toContain(handler);

            eventBus.unregisterAll();
            expect(eventBus.handlers).toHaveLength(0);
        });
    });

    describe('#publish()', () => {
        it('should publish an event to a handler that supports it', async () => {
            eventBus.registerHandler(handler);
            await eventBus.publish(event);

            expect(handler.handle).toHaveBeenCalledWith(event, undefined);
        });

        it('should not publish an event to a handler that does not support it', async () => {
            handler.supports.mockReturnValue(['OtherEvent']);

            eventBus.registerHandler(handler);
            await eventBus.publish(event);

            expect(handler.handle).not.toHaveBeenCalled();
        });

        it('should throw EventsFailedException if a handler throws an error', async () => {
            handler.handle.mockRejectedValue(new Error('Handler error'));

            eventBus.registerHandler(handler);

            let isRejected = false;
            try {
                await eventBus.publish(event);
            } catch (e: EventsFailedException | unknown) {
                expect(e).toBeInstanceOf(EventsFailedException);
                expect((e as EventsFailedException).exceptions).toHaveLength(1);
                expect((e as EventsFailedException).exceptions[0]).toBeInstanceOf(EventFailedException);
                expect((e as EventsFailedException).exceptions[0].message).toBe('Error: Handler error');
                isRejected = true;
            }

            expect(isRejected).toBe(true);
        });
    });
});