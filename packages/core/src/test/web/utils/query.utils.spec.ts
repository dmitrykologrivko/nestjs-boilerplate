import {
    extractSearchQuery,
    extractOrderingQuery,
    extractWhereQuery,
    extractPagePaginationQuery,
    extractLimitOffsetPaginationQuery,
    extractListQuery
} from '../../../web/utils/query.utils';
import { Request } from '../../../web/request/request';

describe('Query Utils', () => {
    let mockRequest: Request;

    beforeEach(() => {
        mockRequest = {
            query: {},
            params: {},
            protocol: 'http',
            hostname: 'localhost',
            url: '/test',
        } as unknown as Request;
    });

    describe('#extractSearchQuery()', () => {
        it('should extract search query', () => {
            mockRequest.query.search = 'test';
            const result = extractSearchQuery(mockRequest);
            expect(result).toEqual({ search: 'test' });
        });

        it('should return empty search if not provided', () => {
            const result = extractSearchQuery(mockRequest);
            expect(result).toEqual({ search: '' });
        });
    });

    describe('#extractOrderingQuery()', () => {
        it('should extract ordering query with single field', () => {
            mockRequest.query.sortBy = 'name';
            const result = extractOrderingQuery(mockRequest);
            expect(result).toEqual({ sortBy: ['name'] });
        });

        it('should extract ordering query with multiple fields', () => {
            mockRequest.query.sortBy = 'name,age';
            const result = extractOrderingQuery(mockRequest);
            expect(result).toEqual({ sortBy: ['name', 'age'] });
        });

        it('should handle field separator', () => {
            mockRequest.query.sortBy = 'user___name';
            const result = extractOrderingQuery(mockRequest, '___');
            expect(result).toEqual({ sortBy: ['user.name'] });
        });
    });

    describe('#extractWhereQuery()', () => {
        it('should extract where query with conditions', () => {
            mockRequest.query.where = 'name__eq=John';
            const result = extractWhereQuery(mockRequest);
            expect(result).toEqual({ where: [['name__eq', 'John']] });
        });

        it('should handle multiple where conditions', () => {
            mockRequest.query.where = ['name__eq=John', 'age__gt=30'];
            const result = extractWhereQuery(mockRequest);
            expect(result).toEqual({ where: [['name__eq', 'John'], ['age__gt', '30']] });
        });

        it('should return empty where if no valid conditions', () => {
            mockRequest.query.where = 'invalidCondition';
            const result = extractWhereQuery(mockRequest);
            expect(result).toEqual({ where: [] });
        });

        it('should handle field separator', () => {
            mockRequest.query.where = 'user___name___eq=John';
            const result = extractWhereQuery(mockRequest, '___');
            expect(result).toEqual({ where: [['user.name___eq', 'John']] });
        });
    });

    describe('#extractPagePaginationQuery()', () => {
        it('should extract page and limit', () => {
            mockRequest.query.page = '2';
            mockRequest.query.limit = '10';
            const result = extractPagePaginationQuery(mockRequest);
            expect(result).toEqual({ page: 2, limit: 10, path: 'http://localhost/test' });
        });

        it('should return undefined for missing page and limit', () => {
            const result = extractPagePaginationQuery(mockRequest);
            expect(result).toEqual({ page: undefined, limit: undefined, path: 'http://localhost/test' });
        });
    });

    describe('#extractLimitOffsetPaginationQuery()', () => {
        it('should extract limit and offset', () => {
            mockRequest.query.limit = '10';
            mockRequest.query.offset = '20';
            const result = extractLimitOffsetPaginationQuery(mockRequest);
            expect(result).toEqual({ limit: 10, offset: 20, path: 'http://localhost/test' });
        });

        it('should return undefined for missing limit and offset', () => {
            const result = extractLimitOffsetPaginationQuery(mockRequest);
            expect(result).toEqual({ limit: undefined, offset: undefined, path: 'http://localhost/test' });
        });
    });

    describe('#extractListQuery()', () => {
        it('should extract all query parameters', () => {
            mockRequest.query = {
                search: 'test',
                sortBy: 'name',
                where: 'age__gt=30',
                page: '1',
                limit: '10',
                offset: '5',
            };
            const result = extractListQuery(mockRequest, '__');
            expect(result).toEqual({
                query: mockRequest.query,
                params: mockRequest.params,
                search: 'test',
                sortBy: ['name'],
                where: [['age__gt', '30']],
                page: 1,
                limit: 10,
                offset: 5,
                path: 'http://localhost/test',
            });
        });
    });
});