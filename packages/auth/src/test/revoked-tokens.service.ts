import { BaseRevokedTokensService } from '../services/base-revoked-tokens.service';

export class RevokedTokensService extends BaseRevokedTokensService {
    private store: Set<string> = new Set<string>();

    async revokeToken(token: string, ttl?: number): Promise<void> {
        this.store.add(token);
    }

    async isTokenRevoked(token: string): Promise<boolean> {
        return this.store.has(token);
    }

    async clearRevokedTokens(): Promise<Promise<void>> {
        this.store.clear();
    }
}
