export abstract class BaseDomainPermission<I = any, E = any> {
    constructor(readonly message: string) {}

    async hasPermission(input: I): Promise<boolean | undefined> {
        return undefined;
    }

    async hasEntityPermission(input: I, entity: E): Promise<boolean | undefined> {
        return undefined;
    }
}
