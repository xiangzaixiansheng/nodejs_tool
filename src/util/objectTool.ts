export function deepCopy<T>(obj: T): T {
    return structuredClone(obj);
}

export function isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
}
