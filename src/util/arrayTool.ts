type CompareType = number | string | bigint;

/**
 * 将数组分成指定大小的较小数组
 * @param array
 * @param size default 1
 * @category Array
 */
export function arrayChunk<T>(array: T[], size = 1): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

/**
 * 移动数组中元素位置
 * @param array
 * @param from 原始位置,如果超过数组长度，则不处理
 * @param to 目标位置
 * @return array 返回原数组
 * @category Array
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const startIndex = from < 0 ? array.length + from : from;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = to < 0 ? array.length + to : to;

    const item = array.splice(from, 1)[0];
    if (item !== undefined) {
      array.splice(endIndex, 0, item);
    }
  }

  return array;
}

/**
 * 对数组进行排序（快速排序实现）
 * @param arr 需要排序的数组
 * @param kFn 比较函数，默认是原值
 */
export function sortBy<T>(
  arr: T[],
  kFn?: (item: T) => CompareType,
): T[] {
  // 边界条件
  if (arr.length <= 1) {
    return arr;
  }

  // 根据中间值对数组分治为两个数组
  const medianIndex = Math.floor(arr.length / 2);
  const medianValue = arr[medianIndex];

  if (medianValue === undefined) {
    return arr;
  }

  const left: T[] = [];
  const right: T[] = [];

  const getValue = kFn ?? ((v: T) => v as unknown as CompareType);
  const medianKey = getValue(medianValue);

  for (let i = 0; i < arr.length; i++) {
    if (i === medianIndex) {
      continue;
    }
    const v = arr[i];
    if (v === undefined) continue;

    if (getValue(v) <= medianKey) {
      left.push(v);
    } else {
      right.push(v);
    }
  }

  return [...sortBy(left, kFn), medianValue, ...sortBy(right, kFn)];
}
