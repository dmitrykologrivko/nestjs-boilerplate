export function all(args: any[]) {
    for (const arg of args) {
        if (!arg) {
            return false;
        }
    }

    return true;
}

export function any(args: any[]) {
    for (const arg of args) {
        if (arg) {
            return true;
        }
    }

    return false;
}

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

export function isNotEmpty(arg: string | any[] | Map<any, any> | Set<any>) {
    return !isEmpty(arg);
}
