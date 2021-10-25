import { Result, ok } from '@nestjs-boilerplate/core';
import { BaseRevokedTokensService } from '../services/base-revoked-tokens.service';

export class RevokedTokensService extends BaseRevokedTokensService {
    private store: Set<string> = new Set<string>();

    async revokeToken(token: string, ttl?: number): Promise<Result<void, any>> {
        this.store.add(token);
        return ok(null);
    }

    async isTokenRevoked(token: string): Promise<Result<boolean, any>> {
        return ok(this.store.has(token));
    }

    async clearRevokedTokens(): Promise<Promise<Result<void, any>>> {
        this.store.clear();
        return ok(null);
    }
}
