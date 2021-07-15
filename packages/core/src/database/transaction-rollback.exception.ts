export class TransactionRollbackException extends Error {
    constructor(message: string) {
        super(message);
    }
}
