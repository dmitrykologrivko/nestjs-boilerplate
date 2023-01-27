import { BaseEvent } from '@nestjs-boilerplate/core';

export class UserRecoveredPasswordEvent extends BaseEvent {

    static NAME = UserRecoveredPasswordEvent.name;

    constructor(
        public readonly userId: number,
    ) {
        super(UserRecoveredPasswordEvent.NAME);
    }
}
