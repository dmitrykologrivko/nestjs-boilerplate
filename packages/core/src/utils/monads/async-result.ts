import {
    Result,
    map,
    mapErr,
    proceed,
    fallback,
} from './result';

/**
 * @deprecated Use Result monad class methods instead
 */
export class AsyncResult<T, E> {
    private constructor(
        private readonly _promise: Promise<Result<T, E>>,
    ) {}

    static merge<T1, E1>(
        results: [Result<T1, E1> | Promise<Result<T1, E1>>],
    ): AsyncResult<[T1], E1>;
    static merge<T1, E1, T2, E2>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
        ],
    ): AsyncResult<[T1, T2], E1 | E2>;
    static merge<T1, E1, T2, E2, T3, E3>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
        ],
    ): AsyncResult<[T1, T2, T3], E1 | E2 | E3>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
            Result<T5, E5> | Promise<Result<T5, E5>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
            Result<T5, E5> | Promise<Result<T5, E5>>,
            Result<T6, E6> | Promise<Result<T6, E6>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
            Result<T5, E5> | Promise<Result<T5, E5>>,
            Result<T6, E6> | Promise<Result<T6, E6>>,
            Result<T7, E7> | Promise<Result<T7, E7>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
            Result<T5, E5> | Promise<Result<T5, E5>>,
            Result<T6, E6> | Promise<Result<T6, E6>>,
            Result<T7, E7> | Promise<Result<T7, E7>>,
            Result<T8, E8> | Promise<Result<T8, E8>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
            Result<T5, E5> | Promise<Result<T5, E5>>,
            Result<T6, E6> | Promise<Result<T6, E6>>,
            Result<T7, E7> | Promise<Result<T7, E7>>,
            Result<T8, E8> | Promise<Result<T8, E8>>,
            Result<T9, E9> | Promise<Result<T9, E9>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9, T10, E10>(
        results: [
            Result<T1, E1> | Promise<Result<T1, E1>>,
            Result<T2, E2> | Promise<Result<T2, E2>>,
            Result<T3, E3> | Promise<Result<T3, E3>>,
            Result<T4, E4> | Promise<Result<T4, E4>>,
            Result<T5, E5> | Promise<Result<T5, E5>>,
            Result<T6, E6> | Promise<Result<T6, E6>>,
            Result<T7, E7> | Promise<Result<T7, E7>>,
            Result<T8, E8> | Promise<Result<T8, E8>>,
            Result<T9, E9> | Promise<Result<T9, E9>>,
            Result<T10, E10> | Promise<Result<T10, E10>>,
        ],
    ): AsyncResult<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>;
    static merge(results: (Result<unknown, unknown> | Promise<Result<unknown, unknown>>)[]) {
        let asyncResult = AsyncResult.from(Result.ok<unknown[], unknown>([]));

        results.forEach(result => {
            asyncResult = asyncResult.proceed(prevValue => {
                return AsyncResult.from(result)
                    .map(currentValue => prevValue.concat([currentValue]))
                    .toPromise();
            });
        });

        return asyncResult;
    }

    static from<T, E>(
        result: Result<T, E> | Promise<Result<T, E>> | (() => Result<T, E> | Promise<Result<T, E>>),
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
        fn: (val: T) => U | Promise<U>,
    ): AsyncResult<U, E> {
        return new AsyncResult<U, E>(
            this._promise.then(
                map(value => Promise.resolve(fn(value))),
            ),
        );
    }

    mapErr<U>(
        fn: (val: E) => U | Promise<U>,
    ): AsyncResult<T, U> {
        return new AsyncResult<T, U>(
            this._promise.then(
                mapErr(error => Promise.resolve(fn(error))),
            ),
        );
    }

    proceed<U, V>(
        fn: (value: T) => Result<U, E | V> | Promise<Result<U, E | V>>,
    ): AsyncResult<U, E | V> {
        return new AsyncResult<U, E | V>(
            this._promise.then(
                proceed(value => Promise.resolve(fn(value))),
            ),
        );
    }

    fallback(
        fn: (err: E) => Result<T, E> | Promise<Result<T, E>>,
    ): AsyncResult<T, E> {
        return new AsyncResult<T, E>(
            this._promise.then(
                fallback(error => Promise.resolve(fn(error))),
            ),
        );
    }

    toPromise(): Promise<Result<T, E>> {
        return this._promise;
    }
}
