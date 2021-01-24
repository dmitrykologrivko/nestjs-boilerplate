import { OneToOne } from 'typeorm';

export function SeparateElement(type: Function) {
    return OneToOne(() => type, { cascade: true });
}
