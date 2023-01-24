import { Result } from './result';

/**
 * Depends on result status: unwraps and returns successful result or throws failed result
 * @param result successful or failed result
 * @returns
 */
export function unwrapResult<T, E, R extends Result<T, E>>(result: R): T {
    if (result.isErr()) {
        throw result.unwrapErr();
    }

    return result.unwrap();
}
