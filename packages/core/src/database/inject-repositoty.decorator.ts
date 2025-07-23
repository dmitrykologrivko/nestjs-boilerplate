import { InjectRepository as NestInjectRepository } from '@nestjs/typeorm';
import { getTargetEntity } from './entity-swappable.service';

export function InjectRepository(entity: Function) {
    return NestInjectRepository(getTargetEntity(entity));
}
