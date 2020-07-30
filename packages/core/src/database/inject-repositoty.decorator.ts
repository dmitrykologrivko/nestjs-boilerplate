import { Inject } from '@nestjs/common';
import { getTargetName } from './entity-swappable.service';

export function InjectRepository(entity: Function) {
    return Inject(`${getTargetName(entity)}Repository`);
}
