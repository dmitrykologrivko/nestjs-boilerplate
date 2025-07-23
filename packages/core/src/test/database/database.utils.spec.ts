import { MockProxy, mock } from 'jest-mock-extended';
import { DataSource, QueryRunner } from 'typeorm';
import { transaction } from '../../database/database.utils';

describe('Database Utils', () => {
    describe('#transaction()', () => {
        let mockDataSource: MockProxy<DataSource>;
        let mockQueryRunner: MockProxy<QueryRunner>;

        beforeEach(() => {
            mockQueryRunner = mock<QueryRunner>();
            mockDataSource = mock<DataSource>();
            mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
        });

        it('should commit the transaction when no errors occur', async () => {
            const mockFn = jest.fn().mockResolvedValue('result');

            const result = await transaction(mockDataSource, mockFn);

            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith(mockQueryRunner);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(result).toBe('result');
        });

        it('should rollback the transaction when an error occurs', async () => {
            const mockFn = jest.fn().mockRejectedValue(new Error('Test Error'));

            await expect(transaction(mockDataSource, mockFn)).rejects.toThrow('Test Error');

            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith(mockQueryRunner);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });
    });
});
