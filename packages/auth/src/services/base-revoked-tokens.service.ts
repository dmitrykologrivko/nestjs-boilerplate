export abstract class BaseRevokedTokensService {

    abstract revokeToken(token: string, ttl?: number): Promise<void>;

    abstract isTokenRevoked(token: string): Promise<boolean>;

    abstract clearRevokedTokens(): Promise<Promise<void>>;

}
