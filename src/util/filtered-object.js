/**
 * Filter properties on an object.
 * @param {Object} obj The object that will have its properties filtered
 * @param {{allowed: (string|number|symbol)[])}} allowed The only allowed properties that will be passed on
 * @returns {Object} The object without unspecified properties
 */
export default function keep(obj, { allowed = ["url", "@id"] }) {
  return Object.keys(obj)
    .filter(allowed.includes(key))
    .reduce((filteredObj, key) => {
      filteredObj[key] = obj[key];
      return filteredObj;
    }, {});
}
