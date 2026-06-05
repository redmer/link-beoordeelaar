/**
 * Enumerate over elements in an iterable with a counter.
 *
 * @param iterable Array, generator or any other iterable object
 * @param start Initial value of the counter, defaults to 0
 */
export default function* enumerate<T>(
  iterable: Iterable<T>,
  start: number = 0
): Generator<[number, T], void, never> {
  let i = start;
  for (const x of iterable) yield [i++, x];
}
