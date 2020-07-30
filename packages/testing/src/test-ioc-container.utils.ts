import {
    Validator,
    MetadataStorage,
    getFromContainer,
    useContainer,
} from 'class-validator';
import { SimpleIocContainer } from './simple-ioc-container';

/**
 * Creates IOC container instance and setup it for "class-validator" library
 */
export function createClassValidatorContainer(): SimpleIocContainer {
    const container = new SimpleIocContainer();

    // Get from default container
    container.register(Validator, getFromContainer(Validator));
    container.register(MetadataStorage, getFromContainer(MetadataStorage));

    useContainer(container, { fallbackOnErrors: false });

    return container;
}
