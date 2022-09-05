export interface KeepOptions<T> {
  /** Keys that are allowed (i.e., not filtered) */
  allowed: T[];
}

/**
 * Filter properties on an object.
 * @param obj The object that will have its direct properties filtered
 * @param allowed The allowed properties that will be passed on.
 * @returns The object without unspecified properties
 */
export default function pick<
  T extends any,
  K extends keyof T,
  O extends KeepOptions<K>
>(obj: T, { allowed }: O): Pick<T, K> {
  return Object.keys(obj)
    .filter((key) => allowed.includes(key as any))
    .reduce((filteredObj, key) => {
      filteredObj[key] = obj[key];
      return filteredObj;
    }, {} as T);
}
