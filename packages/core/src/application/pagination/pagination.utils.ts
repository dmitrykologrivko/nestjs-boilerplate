import { URL } from 'url';

export function replaceUrlQueryParam(
    url: string,
    key: string,
    value: string | number | boolean | null | undefined
) {
    try {
        const parsedUrl = new URL(url);
        const safeValue = value !== null && value !== undefined ? String(value) : '';
        parsedUrl.searchParams.set(key, safeValue);
        return parsedUrl.toString();
    } catch (e) {
        return null;
    }
}

export function removeUrlQueryParam(url: string, key: string) {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.delete(key);
        return parsedUrl.toString();
    } catch (e) {
        return null;
    }
}
