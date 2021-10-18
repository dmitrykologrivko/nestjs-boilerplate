import { BaseEvent } from '@nestjs-boilerplate/core';

export class UserChangedPasswordEvent extends BaseEvent {

    static NAME = UserChangedPasswordEvent.name;

    constructor(
        public readonly userId: number,
        public readonly extra?: Record<string, any>,
    ) {
        super(UserChangedPasswordEvent.NAME);
    }
}
