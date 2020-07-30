type ConstructorFunction = new (...args: any[]) => any;

/**
 * Simple implementation of IOC container for testing purposes
 */
export class SimpleIocContainer {

    // @ts-ignore
    protected instances: [{ type: ConstructorFunction, object: any }] = [];

    /**
     * Get class instance from IOC container by constructor function
     * @param type construction function
     * @return construction function instance
     */
    get<T>(type: ConstructorFunction): T {
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
    register(type: ConstructorFunction, object: any, isMockObject: boolean = false) {
        if (!(object instanceof type) && !isMockObject) {
            throw new Error(`Provided object is not instance of ${type.name}`);
        }

        this.instances.push({ type, object });
    }
}
