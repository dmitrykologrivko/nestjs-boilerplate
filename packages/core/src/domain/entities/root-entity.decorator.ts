import {
    DatabaseEntityOptions,
} from '../../database/database-entity.decorator';
import { Entity } from './entity.decorator';

export function RootEntity(options?: DatabaseEntityOptions) {
    return Entity(options);
}
