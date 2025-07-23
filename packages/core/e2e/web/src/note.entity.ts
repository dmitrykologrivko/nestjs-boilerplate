import { Column } from 'typeorm';
import { Entity } from '../../../src/database/entity.decorator';
import { BaseTypeormEntity } from '../../../src/application/entities/base-typeorm.entity';

@Entity()
export class Note extends BaseTypeormEntity {
    @Column()
    note: string;
}
