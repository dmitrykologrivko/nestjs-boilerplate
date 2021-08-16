import { Constructor } from '@nestjs-boilerplate/core';

/**
 * Simple implementation of IOC container for testing purposes
 */
export class SimpleIocContainer {

    protected instances: Array<{ type: Constructor, object: any }> = [];

    /**
     * Get class instance from IOC container by constructor function
     * @param type construction function
     * @return construction function instance
     */
    get<T>(type: Constructor): T {
        const instance = this.instances.find(currentInstance => currentInstance.type === type);

        if (!instance) {
            throw new Error(`${type.name} is not registered in container`);
        }

        return instance.object as T;
    }

    /**
     * Register new construction function instance in the IOC container
     * @param type construction function
     * @param object construction function instance
     * @param isMockObject if true then type checking is ignored
     * @throws will throw an error if the object is not instance of type and isMockObject flag is false
     */
    register(type: Constructor, object: any, isMockObject: boolean = false) {
        if (!(object instanceof type) && !isMockObject) {
            throw new Error(`Provided object is not instance of ${type.name}`);
        }

        this.instances.push({ type, object });
    }
}
