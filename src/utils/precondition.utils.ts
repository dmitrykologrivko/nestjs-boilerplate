export function isDefined(arg: any) {
    return arg !== undefined && arg !== null;
}

export function isUndefined(arg: any) {
    return !isDefined(arg);
}

export function allDefined(...args: any[]) {
    for (const arg in args) {
        if (isUndefined(arg)) {
            return false;
        }
    }

    return true;
}

export function isEmpty(arg: string | any[] | Map<any, any> | Set<any>) {
    if (isUndefined(arg)) {
        return true;
    }

    if (typeof arg === 'string' && arg.length !== 0) {
        return false;
    }

    if (arg instanceof Array && arg.length !== 0) {
        return false;
    }

    if (arg instanceof Map && arg.size !== 0) {
        return false;
    }

    if (arg instanceof Set && arg.size !== 0) {
        return false;
    }

    return true;
}

export function isNotEmpty(arg: string | any[] | Map<any, any> | Set<any>) {
    return !isEmpty(arg);
}
