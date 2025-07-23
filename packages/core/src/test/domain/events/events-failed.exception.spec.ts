import { EventFailedException } from '../../../domain/events/event-failed.exception';
import { EventsFailedException } from '../../../domain/events/events-failed.exception';

describe('EventsFailedException', () => {
    describe('#add()', () => {
        it('should add exception to list', () => {
            const ex = new EventFailedException();
            const testEx = new EventsFailedException();

            expect(testEx.exceptions.length).toBe(0);

            testEx.add(ex);

            expect(testEx.exceptions.length).toBe(1);
            expect(testEx.exceptions[0]).toBe(ex);
        });
    });

    describe('#length()', () => {
        it('should return length of the exceptions list', () => {
            const ex = new EventFailedException();
            const testEx = new EventsFailedException();

            expect(testEx.exceptions.length).toBe(0);
            expect(testEx.length()).toBe(0);

            testEx.add(ex);

            expect(testEx.exceptions.length).toBe(1);
            expect(testEx.exceptions[0]).toBe(ex);
            expect(testEx.length()).toBe(1);
        });
    });
});
