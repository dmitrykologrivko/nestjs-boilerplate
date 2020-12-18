export abstract class BaseDomainPermission<I = any, E = any> {
    hasPermission(input: I): boolean | undefined {
        return undefined;
    }

    hasEntityPermission(input: I, entity: E): boolean | undefined {
        return undefined;
    }
}
