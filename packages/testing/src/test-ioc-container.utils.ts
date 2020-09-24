import { useContainer, UseContainerOptions } from 'class-validator';
import { SimpleIocContainer } from './simple-ioc-container';

/**
 * Creates IOC container instance and setup it for "class-validator" library
 * @param options "class-validator" library options for container
 */
export function createClassValidatorContainer(
    options: UseContainerOptions = { fallbackOnErrors: true },
): SimpleIocContainer {
    const container = new SimpleIocContainer();

    useContainer(container, options);

    return container;
}
