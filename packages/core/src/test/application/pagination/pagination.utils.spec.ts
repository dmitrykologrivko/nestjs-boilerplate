import { replaceUrlQueryParam, removeUrlQueryParam } from '../../../application/pagination/pagination.utils';

describe('Pagination Utils', () => {
    describe('#replaceUrlQueryParam()', () => {
        it('should replace an existing query parameter', () => {
            const url = 'http://example.com?page=1&limit=10';
            const result = replaceUrlQueryParam(url, 'page', 2);
            expect(result).toBe('http://example.com/?page=2&limit=10');
        });

        it('should add a new query parameter if it does not exist', () => {
            const url = 'http://example.com?limit=10';
            const result = replaceUrlQueryParam(url, 'page', 1);
            expect(result).toBe('http://example.com/?limit=10&page=1');
        });

        it('should return null for an invalid URL', () => {
            const url = 'invalid-url';
            const result = replaceUrlQueryParam(url, 'page', 1);
            expect(result).toBeNull();
        });
    });

    describe('#removeUrlQueryParam()', () => {
        it('should remove an existing query parameter', () => {
            const url = 'http://example.com?page=1&limit=10';
            const result = removeUrlQueryParam(url, 'page');
            expect(result).toBe('http://example.com/?limit=10');
        });

        it('should do nothing if the query parameter does not exist', () => {
            const url = 'http://example.com?limit=10';
            const result = removeUrlQueryParam(url, 'page');
            expect(result).toBe('http://example.com/?limit=10');
        });

        it('should return null for an invalid URL', () => {
            const url = 'invalid-url';
            const result = removeUrlQueryParam(url, 'page');
            expect(result).toBeNull();
        });
    });
});