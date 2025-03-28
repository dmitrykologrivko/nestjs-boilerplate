import { EventFailedException } from './event-failed.exception';

export class EventsFailedException {

    exceptions: EventFailedException[];

    constructor() {
        this.exceptions = [];
    }

    add(exception: EventFailedException) {
        this.exceptions.push(exception);
    }

    length() {
        return this.exceptions.length;
    }
}
