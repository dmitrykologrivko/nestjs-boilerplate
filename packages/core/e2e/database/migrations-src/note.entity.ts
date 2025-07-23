import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity } from '../../../src/database/entity.decorator';
import { BaseEntity } from '../../../src/domain/entities/base.entity';

@Entity()
export class Note extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    note: string;

}
