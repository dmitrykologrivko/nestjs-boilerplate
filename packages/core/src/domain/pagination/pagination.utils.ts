import { URL } from 'url';

export function replaceUrlQueryParam(url: string, key: string, value: any) {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set(key, value.toString());
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
