/**
 * Enumerate over elements in an iterable with a counter.
 *
 * @param {Iterable<T>} iterable Array, generator or any other object that implements [Symbol.iterator]
 * @param {number?} start Initial value of the counter, defaults to 0.
 * @return {Generator<[T, number], void, never} The next count and value from the iterable.
 */
export default function* enumerate(iterable, start = 0) {
  let i = start;
  for (const x of iterable) yield [i++, x];
}
