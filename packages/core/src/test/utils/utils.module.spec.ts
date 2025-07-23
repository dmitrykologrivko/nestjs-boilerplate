import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilsModule } from '../../utils/utils.module';
import { ClassValidator } from '../../utils/validation/class-validator.util';
import { ClassTransformer } from '../../utils/class-transformer.util';

describe('UtilsModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata) {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    it('should register services in the module', async () => {
        module = await createTestingModule({
            imports: [
                UtilsModule,
            ]
        });

        const classValidator = module.get(ClassValidator);
        const classTransformer = module.get(ClassTransformer);

        expect(classValidator).toBeDefined();
        expect(classValidator).toBeInstanceOf(ClassValidator);
        expect(classTransformer).toBeDefined();
        expect(classTransformer).toBeInstanceOf(ClassTransformer);
    });
});
