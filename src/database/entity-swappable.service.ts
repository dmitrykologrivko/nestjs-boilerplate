export function getTargetName(entity: Function) {
    return EntitySwappableService.findSwappable(entity)?.name || entity.name;
}

export class EntitySwappableService {

    private static readonly allowedEntities = new Set<string>();
    private static readonly swappableEntities = new Map<string, Function>();

    static allowSwappable(entity: Function) {
        EntitySwappableService.allowedEntities.add(entity.name);
    }

    static swapEntity<E extends Function, S extends E>(entity: E, swappableEntity: S) {
        if (EntitySwappableService.allowedEntities.has(entity.name)) {
            EntitySwappableService.swappableEntities.set(entity.name, swappableEntity);
            return;
        }

        throw new Error(`${entity.name} is not allowed to be swapped`);
    }

    static swapEntities<E extends Function, S extends E>(entities: Array<[E, S]>) {
        entities.forEach(el => EntitySwappableService.swapEntity(el[0], el[1]));
    }

    static findSwappable(entity: Function) {
        return EntitySwappableService.swappableEntities.get(entity.name);
    }
}
