import { TFunction } from '../utils/type.utils';

export function getTargetName(entity: TFunction) {
    return EntitySwappableService.findSwappable(entity)?.name || entity.name;
}

export function getTargetEntity(entity: TFunction) {
    return EntitySwappableService.findSwappable(entity) || entity;
}

export class EntitySwappableService {

    private static readonly _allowedEntities = new Set<string>();
    private static readonly _swappableEntities = new Map<string, TFunction>();

    static allowSwappable(entity: TFunction) {
        EntitySwappableService._allowedEntities.add(entity.name);
    }

    static swapEntity<E extends TFunction, S extends E>(entity: E, swappableEntity: S) {
        if (EntitySwappableService._allowedEntities.has(entity.name)) {
            EntitySwappableService._swappableEntities.set(entity.name, swappableEntity);
            return;
        }

        throw new Error(`${entity.name} is not allowed to be swapped`);
    }

    static findSwappable(entity: TFunction) {
        return EntitySwappableService._swappableEntities.get(entity.name);
    }

    static clear() {
        EntitySwappableService._allowedEntities.clear();
        EntitySwappableService._swappableEntities.clear();
    }

    static get allowedEntities(): Set<string> {
        return this._allowedEntities;
    }

    static get swappableEntities(): Map<string, TFunction> {
        return this._swappableEntities;
    }
}
