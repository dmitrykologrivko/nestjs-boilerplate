import { Result } from './result';

export class AsyncResult<T, E> {
    private constructor(
        private readonly _promise: Promise<Result<T, E>>,
    ) {}

    static from<T, E>(
        result: Result<T, E> | Promise<Result<T, E>> | (() => Result<T, E>) | (() => Promise<Result<T, E>>),
    ): AsyncResult<T, E> {
        if (typeof result === 'function') {
            result = result();
        }

        if (result instanceof Promise) {
            return new AsyncResult(result);
        }

        return new AsyncResult<T, E>(Promise.resolve(result));
    }

    map<U>(
        fn: ((val: T) => U) | ((val: T) => Promise<U>),
    ): AsyncResult<U, E> {
        const newPromise = this._promise.then(result => {
            return result.mapAsync(value => Promise.resolve(fn(value)));
        });

        return new AsyncResult<U, E>(newPromise);
    }

    mapErr<U>(
        fn: ((val: E) => U) | ((val: E) => Promise<U>),
    ): AsyncResult<T, U> {
        const newPromise = this._promise.then(result => {
            return result.mapErrAsync(value => Promise.resolve(fn(value)));
        });

        return new AsyncResult<T, U>(newPromise);
    }

    proceed<U, V>(
        fn: ((value: T) => Result<U, E | V>) | ((value: T) => Promise<Result<U, E | V>>),
    ): AsyncResult<U, E | V> {
        const newPromise = this._promise.then(result => {
            return result.proceedAsync(value => Promise.resolve(fn(value)));
        });

        return new AsyncResult<U, E | V>(newPromise);
    }

    fallback(
        fn: ((err: E) => Result<T, E>) | ((err: E) => Promise<Result<T, E>>),
    ): AsyncResult<T, E> {
        const newPromise = this._promise.then(result => {
            return result.fallbackAsync(error => Promise.resolve(fn(error)));
        });

        return new AsyncResult<T, E>(newPromise);
    }

    toPromise(): Promise<Result<T, E>> {
        return this._promise;
    }

    /**
     * @deprecated
     * @param fn
     */
    and_then<U, V>(
        fn: ((value: T) => Result<U, E | V>) | ((value: T) => Promise<Result<U, E | V>>),
    ): AsyncResult<U, E | V>  {
        return this.proceed(fn);
    }

    /**
     * @deprecated
     * @param fn
     */
    map_err<U>(fn: ((val: E) => U) | ((val: E) => Promise<U>)): AsyncResult<T, U> {
        return this.mapErr(fn);
    }

    /**
     * @deprecated
     */
    toResult(): Promise<Result<T, E>> {
        return this._promise;
    }
}
