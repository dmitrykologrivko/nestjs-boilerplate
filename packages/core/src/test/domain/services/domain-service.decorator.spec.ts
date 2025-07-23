import 'reflect-metadata';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';
import { DomainService } from '../../../domain/services/domain-service.decorator';

describe('DomainService', () => {
    it('should make the class injectable', () => {
        @DomainService()
        class TestService {}

        const injectableMetadata = Reflect.getMetadata(INJECTABLE_WATERMARK, TestService);
        expect(injectableMetadata).toBeDefined();
    });
});
