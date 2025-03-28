import { DataSource, QueryRunner } from 'typeorm';
import { TransactionRollbackException } from './transaction-rollback.exception';

/**
 * A utility function to run a transaction with a query runner.
 * @param dataSource Typeorm data source
 * @param fn The function to run inside the transaction
 * @throws TransactionRollbackException
 */
export async function transaction<T>(
    dataSource: DataSource,
    fn: (queryRunner: QueryRunner) => Promise<T>,
): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const result = await fn(queryRunner);
        await queryRunner.commitTransaction();
        return result;
    } catch (e) {
        await queryRunner.rollbackTransaction();
        throw new TransactionRollbackException(e.stack);
    } finally {
        await queryRunner.release();
    }
}
