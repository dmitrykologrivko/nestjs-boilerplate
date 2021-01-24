import {
    DatabaseEntityOptions,
} from '../../database/database-entity.decorator';
import { Entity } from './entity.decorator';

export function AggregateRoot(options?: DatabaseEntityOptions) {
    return Entity(options);
}
