import {
    all,
    any,
    isEmpty,
    isNotEmpty,
    isDefined,
} from '../../utils/precondition.utils';

describe('Precondition Utils', () => {
    describe('#all()', () => {
        it('returns true when all items in the array are defined', () => {
            expect(all([1, 'string', true, {}])).toBe(true);
        });

        it('returns false when any item in the array is undefined or null', () => {
            expect(all([1, null, 'string'])).toBe(false);
            expect(all([undefined, 2, 3])).toBe(false);
        });
    });

    describe('#any()', () => {
        it('returns true when any item in the array is defined', () => {
            expect(any([null, undefined, 0, 'value'])).toBe(true);
        });

        it('returns false when all items in the array are undefined or falsy', () => {
            expect(any([null, undefined, 0, ''])).toBe(false);
        });
    });

    describe('#isEmpty()', () => {
        it('returns true when the argument is an empty string, array, map, or set', () => {
            expect(isEmpty('')).toBe(true);
            expect(isEmpty([])).toBe(true);
            expect(isEmpty(new Map())).toBe(true);
            expect(isEmpty(new Set())).toBe(true);
        });

        it('returns false when the argument is a non-empty string, array, map, or set', () => {
            expect(isEmpty('value')).toBe(false);
            expect(isEmpty([1])).toBe(false);
            expect(isEmpty(new Map([['key', 'value']]))).toBe(false);
            expect(isEmpty(new Set([1]))).toBe(false);
        });
    });

    describe('#isNotEmpty()', () => {
        it('returns true when the argument is defined and not empty', () => {
            expect(isNotEmpty('value')).toBe(true);
            expect(isNotEmpty([1])).toBe(true);
            expect(isNotEmpty(new Map([['key', 'value']]))).toBe(true);
            expect(isNotEmpty(new Set([1]))).toBe(true);
        });

        it('returns false when the argument is undefined, null, or empty', () => {
            expect(isNotEmpty('')).toBe(false);
            expect(isNotEmpty([])).toBe(false);
            expect(isNotEmpty(new Map())).toBe(false);
            expect(isNotEmpty(new Set())).toBe(false);
            expect(isNotEmpty(null)).toBe(false);
            expect(isNotEmpty(undefined)).toBe(false);
        });
    });

    describe('#isDefined()', () => {
        it('returns true when the argument is defined (not null or undefined)', () => {
            expect(isDefined(0)).toBe(true);
            expect(isDefined('')).toBe(true);
            expect(isDefined(false)).toBe(true);
            expect(isDefined([])).toBe(true);
        });

        it('returns false when the argument is undefined or null', () => {
            expect(isDefined(undefined)).toBe(false);
            expect(isDefined(null)).toBe(false);
        });
    });
});
