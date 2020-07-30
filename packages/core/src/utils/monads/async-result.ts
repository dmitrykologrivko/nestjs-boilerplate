import { Result, Ok, Err } from '@usefultools/monads';

export class AsyncResult<T, E> {
    private constructor(
        private readonly promise: Promise<Result<T, E>>,
    ) {}

    static from<T, E>(
        result: Result<T, E> | Promise<Result<T, E>> | (() => Result<T, E> | Promise<Result<T, E>>),
    ): AsyncResult<T, E> {
        if (typeof result === 'function') {
            result = result();
        }

        if (result instanceof Promise) {
            return new AsyncResult(result);
        }

        return new AsyncResult(Promise.resolve(result));
    }

    map<U>(fn: (val: T) => U | Promise<U>): AsyncResult<U, E> {
        const newPromise = this.promise.then(async val => {
            if (val.is_ok()) {
                return Ok(await fn(val.unwrap()));
            }

            return Promise.reject(val.unwrap_err());
        });

        return new AsyncResult(newPromise);
    }

    map_err<U>(fn: (val: E) => U | Promise<U>): AsyncResult<T, U> {
        const newPromise = this.promise.then(val => {
            if (val.is_ok()) {
                return Ok(val.unwrap());
            }

            return Promise.reject(val.unwrap_err());
        }).catch(async err => Promise.reject(await fn(err)));

        return new AsyncResult(newPromise);
    }

    and_then<U>(fn: (val: T) => Result<U, E> | Promise<Result<U, E>>): AsyncResult<U, E> {
        const newPromise = this.promise.then(val => {
            if (val.is_ok()) {
                return fn(val.unwrap());
            }

            return Promise.reject(val.unwrap_err());
        });

        return new AsyncResult(newPromise);
    }

    async toResult(): Promise<Result<T, E>> {
        try {
            return await this.promise;
        } catch (e) {
            return Err(e);
        }
    }
}
