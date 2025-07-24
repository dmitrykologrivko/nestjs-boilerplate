import { EventFailedException } from './event-failed.exception';

export class EventsFailedException extends Error {

    exceptions: EventFailedException[];

    constructor() {
        super();
        this.exceptions = [];
    }

    add(exception: EventFailedException) {
        this.exceptions.push(exception);
    }

    length() {
        return this.exceptions.length;
    }
}
