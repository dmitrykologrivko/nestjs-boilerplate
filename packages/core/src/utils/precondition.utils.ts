/**
 * Checks if all items of array are defined
 */
export function all(args: any[]) {
    for (const arg of args) {
        if (!arg) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if any item of array is defined
 */
export function any(args: any[]) {
    for (const arg of args) {
        if (arg) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if provided string, array, map or set is undefined or empty
 */
export function isEmpty(arg: string | any[] | Map<any, any> | Set<any>) {
    if (!arg) {
        return true;
    }

    if (arg instanceof Array && arg.length === 0) {
        return true;
    }

    if (arg instanceof Map && arg.size === 0) {
        return true;
    }

    if (arg instanceof Set && arg.size === 0) {
        return true;
    }

    return false;
}

/**
 * Checks if provided string, array, map or set is defined and not empty
 */
export function isNotEmpty(arg: string | any[] | Map<any, any> | Set<any>) {
    return !isEmpty(arg);
}

/**
 * Checks if provided argument is defined (!== undefined, !== null).
 * @param arg
 */
export function isDefined(arg: any) {
    return arg !== undefined && arg !== null;
}
