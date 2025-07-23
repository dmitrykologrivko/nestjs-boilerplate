export function getTargetName(entity: Function) {
    return EntitySwappableService.findSwappable(entity)?.name || entity.name;
}

export function getTargetEntity(entity: Function) {
    return EntitySwappableService.findSwappable(entity) || entity;
}

export class EntitySwappableService {

    private static readonly _allowedEntities = new Set<string>();
    private static readonly _swappableEntities = new Map<string, Function>();

    static allowSwappable(entity: Function) {
        EntitySwappableService._allowedEntities.add(entity.name);
    }

    static swapEntity<E extends Function, S extends E>(entity: E, swappableEntity: S) {
        if (EntitySwappableService._allowedEntities.has(entity.name)) {
            EntitySwappableService._swappableEntities.set(entity.name, swappableEntity);
            return;
        }

        throw new Error(`${entity.name} is not allowed to be swapped`);
    }

    static findSwappable(entity: Function) {
        return EntitySwappableService._swappableEntities.get(entity.name);
    }

    static clear() {
        EntitySwappableService._allowedEntities.clear();
        EntitySwappableService._swappableEntities.clear();
    }

    static get allowedEntities(): Set<string> {
        return this._allowedEntities;
    }

    static get swappableEntities(): Map<string, Function> {
        return this._swappableEntities;
    }
}
