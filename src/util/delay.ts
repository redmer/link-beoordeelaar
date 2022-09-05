/**
 * Delay execution by milliseconds. Awaitable.
 *
 * @param ms Timeout in milliseconds.
 */
export default function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
