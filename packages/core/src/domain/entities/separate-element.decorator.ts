import { applyDecorators } from '@nestjs/common';
import { OneToOne, JoinColumn } from 'typeorm';

export function SeparateElement(type: Function) {
    return applyDecorators(
        OneToOne(() => type, { cascade: true }),
        JoinColumn(),
    );
}
