export type Constructor<T = {}> = new (...args: any[]) => T;
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * Wrapper for module options
 */
export interface ModuleOptions<T, V> {
    type: undefined | 'async';
    value: T | V;
}
