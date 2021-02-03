import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, BaseEntity } from '@nestjs-boilerplate/core';

@Entity()
export class Note implements BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    note: string;

}
