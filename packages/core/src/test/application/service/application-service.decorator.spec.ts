import 'reflect-metadata';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';
import { ApplicationService } from '../../../application/service/application-service.decorator';

describe('ApplicationService', () => {
    it('should make the class injectable', () => {
        @ApplicationService()
        class TestService {}

        const injectableMetadata = Reflect.getMetadata(INJECTABLE_WATERMARK, TestService);
        expect(injectableMetadata).toBeDefined();
    });
});
