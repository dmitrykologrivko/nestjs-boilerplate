import { Result } from '@nestjs-boilerplate/core';

export abstract class BaseRevokedTokensService {

    abstract revokeToken(token: string, ttl: number): Promise<Result<void, any>>;

    abstract isTokenRevoked(token: string): Promise<Result<boolean, any>>;

    abstract clearRevokedTokens(): Promise<Promise<Result<void, any>>>;

}
