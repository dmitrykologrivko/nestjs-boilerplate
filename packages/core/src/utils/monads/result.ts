import { Monad } from './monad.interface';

export enum ResultType {
    OK = 'ok',
    ERR = 'err',
}

export class Result<T, E, R extends ResultType = ResultType> implements Monad<T> {
    private constructor(
        private readonly type: R,
        private readonly value: R extends ResultType.OK ? T : E,
    ) {}

    static merge<T1, E1>(
        results: [Result<T1, E1>],
    ): Result<[T1], E1>;
    static merge<T1, E1, T2, E2>(
        results: [Result<T1, E1>, Result<T2, E2>],
    ): Result<[T1, T2], E1 | E2>;
    static merge<T1, E1, T2, E2, T3, E3>(
        results: [Result<T1, E1>, Result<T2, E2>, Result<T3, E3>],
    ): Result<[T1, T2, T3], E1 | E2 | E3>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
        ],
    ): Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
            Result<T5, E5>,
        ],
    ): Result<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
            Result<T5, E5>,
            Result<T6, E6>,
        ],
    ): Result<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
            Result<T5, E5>,
            Result<T6, E6>,
            Result<T7, E7>,
        ],
    ): Result<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
            Result<T5, E5>,
            Result<T6, E6>,
            Result<T7, E7>,
            Result<T8, E8>,
        ],
    ): Result<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
            Result<T5, E5>,
            Result<T6, E6>,
            Result<T7, E7>,
            Result<T8, E8>,
            Result<T9, E9>,
        ],
    ): Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>;
    static merge<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9, T10, E10>(
        results: [
            Result<T1, E1>,
            Result<T2, E2>,
            Result<T3, E3>,
            Result<T4, E4>,
            Result<T5, E5>,
            Result<T6, E6>,
            Result<T7, E7>,
            Result<T8, E8>,
            Result<T9, E9>,
            Result<T10, E10>,
        ],
    ): Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>;
    static merge(results: Result<unknown, unknown>[]) {
        return results.reduce(
            (prev: Result<unknown[], unknown>, current: Result<unknown, unknown>) => {
                return current.proceed(
                    currentValue => prev.map(prevValue => prevValue.concat([currentValue])),
                );
            },
            Result.ok<unknown[], unknown>([]),
        );
    }

    static mergeAsync<T1, E1>(
        results: [Promise<Result<T1, E1>>],
    ): Promise<Result<[T1], E1>>;
    static mergeAsync<T1, E1, T2, E2>(
        results: [Promise<Result<T1, E1>>, Promise<Result<T2, E2>>],
    ): Promise<Result<[T1, T2], E1 | E2>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3>(
        results: [Promise<Result<T1, E1>>, Promise<Result<T2, E2>>, Promise<Result<T3, E3>>],
    ): Promise<Result<[T1, T2, T3], E1 | E2 | E3>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
            Promise<Result<T5, E5>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
            Promise<Result<T5, E5>>,
            Promise<Result<T6, E6>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
            Promise<Result<T5, E5>>,
            Promise<Result<T6, E6>>,
            Promise<Result<T7, E7>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
            Promise<Result<T5, E5>>,
            Promise<Result<T6, E6>>,
            Promise<Result<T7, E7>>,
            Promise<Result<T8, E8>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
            Promise<Result<T5, E5>>,
            Promise<Result<T6, E6>>,
            Promise<Result<T7, E7>>,
            Promise<Result<T8, E8>>,
            Promise<Result<T9, E9>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>>;
    static mergeAsync<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9, T10, E10>(
        results: [
            Promise<Result<T1, E1>>,
            Promise<Result<T2, E2>>,
            Promise<Result<T3, E3>>,
            Promise<Result<T4, E4>>,
            Promise<Result<T5, E5>>,
            Promise<Result<T6, E6>>,
            Promise<Result<T7, E7>>,
            Promise<Result<T8, E8>>,
            Promise<Result<T9, E9>>,
            Promise<Result<T10, E10>>,
        ],
    ): Promise<Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>>;
    static mergeAsync(results: Promise<Result<unknown, unknown>>[]) {
        return results.reduce(
            (prev: Promise<Result<unknown[], unknown>>, current: Promise<Result<unknown, unknown>>) => {
                return current.then(
                    proceed(currentValue => prev.then(
                        map(prevValue => Promise.resolve(prevValue.concat([currentValue])))),
                    ),
                );
            },
            Promise.resolve(Result.ok<unknown[], unknown>([])),
        );
    }

    static ok<T = never, E = never>(value: T): Result<T, E> {
        return new Result<T, E, ResultType.OK>(ResultType.OK, value);
    }

    static err<T = never, E = never>(value: E): Result<T, E> {
        return new Result<T, E, ResultType.ERR>(ResultType.ERR, value);
    }

    static from<T>(value: T): Result<T, never> {
        return ok(value);
    }

    static map<T, E, U>(fn: (value: T) => Promise<U>) {
        return (result: Result<T, E>): Promise<Result<U, E>> => result.mapAsync(fn);
    }

    static mapErr<T, E, U>(fn: (err: E) => Promise<U>) {
        return (result: Result<T, E>): Promise<Result<T, U>> => result.mapErrAsync(fn);
    }

    static proceed<T, E, U, V>(fn: (value: T) => Promise<Result<U, V>>) {
        return (result: Result<T, E>): Promise<Result<U, E | V>> => result.proceedAsync(fn);
    }

    static fallback<T, E>(fn: (err: E) => Promise<Result<T, E>>) {
        return (result: Result<T, E>): Promise<Result<T, E>> => result.fallbackAsync(fn);
    }

    isOk() {
        return this.type === ResultType.OK;
    }

    isErr() {
        return this.type === ResultType.ERR;
    }

    unwrap(): T {
        if (this.isOk()) {
            return this.value as T;
        }
        throw ReferenceError('Cannot unwrap OK value of ResultType.ERR');
    }

    unwrapOr(value: T): T {
        if (this.isOk()) {
            return this.value as T;
        }
        return value;
    }

    unwrapOrElse(fn: (err: E) => T): T {
        if (this.isOk()) {
            return this.value as T;
        }
        return fn(this.value as E);
    }

    unwrapErr(): E {
        if (this.isErr()) {
            return this.value as E;
        }
        throw ReferenceError('Cannot unwrap ERR value of ResultType.OK');
    }

    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this.isErr()) {
            return Result.err<U, E>(this.value as E);
        }
        return Result.ok<U, E>(fn(this.value as T));
    }

    mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
        if (this.isErr()) {
            return Promise.resolve(Result.err<U, E>(this.value as E));
        }
        return fn(this.value as T).then(mappedValue => Result.ok<U, E>(mappedValue));
    }

    mapErr<U>(fn: (err: E) => U): Result<T, U> {
        if (this.isErr()) {
            return Result.err<T, U>(fn(this.value as E));
        }
        return Result.ok<T, U>(this.value as T);
    }

    mapErrAsync<U>(fn: (err: E) => Promise<U>): Promise<Result<T, U>> {
        if (this.isErr()) {
            return fn(this.value as E).then(mappedError => Result.err<T, U>(mappedError));
        }
        return Promise.resolve(Result.ok<T, U>(this.value as T));
    }

    proceed<U, V>(fn: (value: T) => Result<U, E | V>): Result<U, E | V>  {
        if (this.isErr()) {
            return Result.err<U, E | V>(this.value as E);
        }
        return fn(this.value as T);
    }

    proceedAsync<U, V>(fn: (value: T) => Promise<Result<U, E | V>>): Promise<Result<U, E | V>>  {
        if (this.isErr()) {
            return Promise.resolve(Result.err<U, E | V>(this.value as E));
        }
        return fn(this.value as T);
    }

    fallback(fn: (err: E) => Result<T, E>): Result<T, E> {
        if (this.isErr()) {
            return fn(this.value as E);
        }
        return this;
    }

    fallbackAsync(fn: (err: E) => Promise<Result<T, E>>): Promise<Result<T, E>> {
        if (this.isErr()) {
            return fn(this.value as E);
        }
        return Promise.resolve(this);
    }
}

export const {
    merge,
    mergeAsync,
    ok,
    err,
    from,
    map,
    mapErr,
    proceed,
    fallback,
} = Result;
