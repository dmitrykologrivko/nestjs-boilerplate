import { InjectRepository as NestInjectRepository } from '@nestjs/typeorm';
import { TFunction } from '../utils/type.utils';
import { getTargetEntity } from './entity-swappable.service';

export function InjectRepository(entity: TFunction) {
    return NestInjectRepository(getTargetEntity(entity));
}
