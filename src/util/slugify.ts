export interface SlugifyOptions {
  /** Converts to ASCII if false */
  allowUnicode: boolean;
}

/**
 * Convert anything into a blog-ready slug.
 *
 * Derived from Django under BSD-3:
 * <https://github.com/django/django/blob/e9fd2b572410b1236da0d3d0933014138d89f44e/django/utils/text.py>
 *
 * @param name The object to be turned into a slug string
 */
export default function slugify(
  name: any,
  { allowUnicode }: SlugifyOptions = null
): string {
  let value = String(name);
  if (allowUnicode) value = value.normalize("KFKC");
  else value = value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-letter, non-whitespace, non -
    .replace(/[-\s]+/g, " ") // replace multiple - ⎵  with single ⎵
    .trim() // may not start or end with ⎵ (space)
    .replace(/\s/g, ""); // replace ⎵  with -
}
