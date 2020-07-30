import { Module } from '@nestjs/common';
import { ClassValidator } from './validation/class-validator.util';
import { ClassTransformer } from './class-transformer.util';

@Module({
    providers: [ClassValidator, ClassTransformer],
    exports: [ClassValidator, ClassTransformer],
})
export class UtilsModule {}
