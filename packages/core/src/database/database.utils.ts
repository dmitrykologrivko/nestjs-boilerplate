import { DataSource, QueryRunner } from 'typeorm';
import { Result, err } from '../utils/monads/result';
import { TransactionRollbackException } from './transaction-rollback.exception';

export async function transaction<T, E>(
    dataSource: DataSource,
    fn: (queryRunner: QueryRunner) => Promise<Result<T, E>>,
): Promise<Result<T, E | TransactionRollbackException>> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const result = await fn(queryRunner);

        if (result.isErr()) {
            await queryRunner.rollbackTransaction();
            return result;
        }

        await queryRunner.commitTransaction();
        return result;
    } catch (e) {
        await queryRunner.rollbackTransaction();
        return err(new TransactionRollbackException(e.stack));
    } finally {
        await queryRunner.release();
    }
}
