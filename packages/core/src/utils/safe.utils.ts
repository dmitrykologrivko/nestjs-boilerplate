export function safeParseInt(value: any): number | undefined {
    const num = parseInt(String(value), 10);
    return isNaN(num) ? undefined : num;
}
