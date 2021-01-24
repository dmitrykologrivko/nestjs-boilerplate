import { applyDecorators } from '@nestjs/common';
import { OneToOne, JoinColumn } from 'typeorm';

export function SeparateElement(type: Function) {
    return applyDecorators(
        OneToOne(() => type, { cascade: true, onDelete: 'CASCADE', primary: true }),
        JoinColumn(),
    );
}
