# Domain Events

An event in the context of software development is an action or occurrence recognized by the software, often originating 
asynchronously from the external environment, which may be handled by the software.

When we talk about the domain events, then we can interpret it as something that happened in the domain and we want 
other parts of the same domain to be informed. Domain events can be used to separate business logic and to react to 
important domain changes in an application.

## Defining Events

There is a simple Event Bus pattern. It includes three main components: Event, Event Subscriber (Event Handler), and 
actually Event Bus. In this section we will touch on the declaration of events, and then we will learn how to publish 
events and handle them.

NestJS Boilerplate defines `BaseEvent` class which allows you to describe in an "accessible language" the name of the 
event occurring and the data structure required for the handler of this event.

Let's create a domain event about order confirmation, so we need to provide an order id and event unique name that 
will be used for detecting subscribed handlers.

```typescript
import { BaseEvent } from '@nestjs-boilerplate/core';

export class OrderConfirmedEvent extends BaseEvent {
    
    static NAME = OrderConfirmedEvent.name;

    constructor(
        public readonly orderId: number,
    ) {
        super(OrderConfirmedEvent.NAME);
    }
}
```

### Predefined Events

NestJS Boilerplate contains generic event classes for entity changes such as:
* EntityCreatingEvent
* EntityCreatedEvent
* EntityUpdatingEvent
* EntityUpdatedEvent
* EntityDestroyingEvent
* EntityDestroyedEvent

Also, entity change events can be published with `EntityEventsManager` class. This class provides a wrapper of events bus
and creating/publishing events logic. This is an injectable class and can be injected into any other service class.

`EntityCreatingEvent`, `EntityUpdatingEvent`, `EntityDestroyingEvent` should be published before committing 
a transaction. In this case, you can rollback the unit of work and prevent an operation by returning an exception. 

`EntityCreatedEvent`, `EntityUpdatedEvent`, `EntityDestroyedEvent` should be published after committing a transaction.
In this case, you cannot rollback the unit of work.

## Publishing events

NestJS Boilerplate defines `EventBus` class which allows you to publish events, subscribe and unsubscribe event 
handlers.

Let's see how we can publish the event that the order is confirmed.

```typescript
import { Repository } from 'typeorm';
import {
    BaseEvent,
    EventBus,
    EventsFailedException,
    ApplicationService,
    InjectRepository,
    Result,
} from '@nestjs-boilerplate/core';
import { Order } from './order.entity';
import { OrderConfirmedEvent } from './order-confirmed.event';

@ApplicationService()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        private eventBus: EventBus,
    ) {}

    async confirmOrder(orderId: number): Promise<Result<void, EventsFailedException>> {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        order.confirm();
        await this.orderRepository.save(order);
        return this.eventBus.publish(new OrderConfirmedEvent(orderId));
    }
}
```

Basically, we create a new instance of `OrderConfirmedEvent` class and pass the order id into the constructor. 
All event handlers will be notified.

### Unit of Work

We can also provide the unit of work to `publish` method if we want the event handling to be in the single transaction.

### Exceptions handling

The `EventBus` publish events to all event handlers even if any of them return/throw an exception. If any exceptions 
were returned/thrown from event handler then the single `EventsFailedException` for all of them will be returned from 
`publish` method.

## Handling Events

NestJS Boilerplate defines `BaseEventHandler` class which allows you to implement event handler. When you extend your 
event handler from `BaseEventHandler` then it needs to implement abstract methods `supports` and `handle`. Method
`supports` must return a list of event names to which the current handler needs to subscribe. Method `handle` 
implements the main logic of the current event handler.

Let's implement event handler for order confirmed event.

```typescript
import { QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseEventHandler, EventFailedException } from '@nestjs-boilerplate/core';
import { OrderConfirmedEvent } from './order-confirmed.event';

@Injectable()
export class OrderConfirmedEventHandler extends BaseEventHandler<OrderConfirmedEvent, QueryRunner> {

    supports(): string[] {
        return [OrderConfirmedEvent.NAME];
    }

    async handle(
        event: OrderConfirmedEvent,
        unitOfWork?: U,
    ): Promise<Result<void, EventFailedException>> {
        console.log(`Handled ${OrderConfirmedEvent.NAME} for order id ${event.orderId}`);
    }
}
```

We can also implement the handling of several events in one event handler class.

```typescript
import { QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseEventHandler, EventFailedException } from '@nestjs-boilerplate/core';
import { OrderConfirmedEvent } from './order-confirmed.event';
import { OrderCancelledEvent } from './order-cancelled.event';

@Injectable()
export class OrderEventsHandler extends BaseEventHandler<OrderConfirmedEvent | OrderCancelledEvent, QueryRunner> {

    supports(): string[] {
        return [OrderConfirmedEvent.NAME, OrderCancelledEvent.NAME];
    }

    async handle(
        event: OrderConfirmedEvent | OrderCancelledEvent,
        unitOfWork?: U,
    ): Promise<Result<void, EventFailedException>> {
        if (event.name === OrderConfirmedEvent.NAME) {
            console.log(`Handled ${OrderConfirmedEvent.NAME} for order id ${event.orderId}`);
        } else {
            console.log(`Handled ${OrderCancelledEvent.NAME} for order id ${event.orderId}`);
        }
    }
}
```

### Registration of handlers

To start receiving events, the event handler must be registered in the Event Bus. You can do registration at the
application initialization time. As `EventBus` is an injectable class then we can register handlers in module class.

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseModule, EventBus } from '@nestjs-boilerplate/core';
import { Order } from './order.entity';
import { OrderConfirmedEvent } from './order-confirmed.event';

@Module({
    imports: [
        DatabaseModule.withEntities([order]),
    ],
    providers: [OrderConfirmedEventHandler],
})
export class OrderModule implements OnModuleInit {
    constructor(
        private eventBus: EventBus,
        private orderConfirmedEventHandler: OrderConfirmedEventHandler,
    ) {}

    onModuleInit(): any {
        this.eventBus.registerHandler(this.orderConfirmedEventHandler);
    }
}
```

### Unregistration of handlers

We can unregister handlers at any time. You can unregister a particular handler or all handlers for specific events 
or all event bus handlers. If you want to unregister a particular handler the main thing here is to provide the same 
instance of the handler object that was provided during registration.

```typescript
import { DatabaseModule, EventBus } from '@nestjs-boilerplate/core';
import { OrderConfirmedEvent } from './order-confirmed.event';
import { OrderConfirmedEventHandler } from './order-confirmed-event.handler';

// Create event bus
const eventBus = new EventBus();

// Create event handler
const handler = new OrderConfirmedEventHandler();

// Register handler
eventBus.registerHandler(handler);

// Unregister handler
eventBus.unregisterHandler(handler);

// Or unregister all handlers by event name
eventBus.unregisterAll(OrderConfirmedEvent.NAME);

// Or unregister all handlers in event bus
eventBus.unregisterAll();
```

