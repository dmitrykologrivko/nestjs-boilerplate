export type Constructor<T = object> = new (...args: any[]) => T;
export type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;
export type Fn<Args extends any[] = any[], Return = any> = (...args: Args) => Return;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type TFunction = Function;

/**
 * Wrapper for module options
 */
export interface ModuleOptions<T, V> {
    type: undefined | 'async';
    value: T | V;
}
