import { BaseEvent } from '@nestjs-boilerplate/core';

export class UserChangedPasswordEvent extends BaseEvent {

    static NAME = UserChangedPasswordEvent.name;

    constructor(
        public readonly userId: number,
        public readonly token?: string,
    ) {
        super(UserChangedPasswordEvent.NAME);
    }
}
