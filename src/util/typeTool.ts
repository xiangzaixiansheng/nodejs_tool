/**
 * @description 类型判断的方法
 * @author xiangzai
 * 
 */

/**
 * 获取数据类型
 * @param value
 * @category Is
 */
function getType(value: any) {
    const toString = Object.prototype.toString;
    if (value == null) {
        return value === undefined ? 'Undefined' : 'Null';
    }
    return toString
        .call(value)
        .replace(/^\[object/, '')
        .replace(/\]$/, '')
        .trim();
}


/**
 * 判断是否为number
 * @param value
 * @category Is
 */
function isNumber(value: any): value is number {
    return getType(value) === 'Number';
}

/**
 * 判断是否为function
 * https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type
 * @param func
 * @category Is
 */
function isFunction(func: any): func is Function {
    return func && {}.toString.call(func) === '[object Function]';
}