import { DataSource, QueryRunner } from 'typeorm';

/**
 * A utility function to run a transaction with a query runner.
 * @param dataSource Typeorm data source
 * @param fn The function to run inside the transaction
 * @throws Will throw an error if the transaction fails
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
        throw e;
    } finally {
        await queryRunner.release();
    }
}
