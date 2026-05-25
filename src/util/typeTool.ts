export function getType(value: unknown): string {
    if (value == null) {
        return value === undefined ? 'Undefined' : 'Null';
    }
    return Object.prototype.toString
        .call(value)
        .replace(/^\[object\s/, '')
        .replace(/\]$/, '');
}

export function isNumber(value: unknown): value is number {
    return getType(value) === 'Number';
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function';
}
