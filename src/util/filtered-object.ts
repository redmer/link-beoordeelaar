/**
 * Filter properties on an object.
 * @param obj The object that will have its direct properties filtered
 * @param allowed The allowed properties that will be passed on.
 * @returns The object without unspecified properties
 */
export default function pick<T extends Record<any, any>>(
  obj: T,
  allowed: (string | number | symbol)[]
): T {
  return Object.keys(obj)
    .filter((key) => allowed.includes(key as any))
    .reduce((filteredObj, key) => {
      // @ts-ignore
      filteredObj[key] = obj[key];
      return filteredObj;
    }, {} as T);
}
