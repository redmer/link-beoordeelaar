/**
 * Convert anything into a blog-ready slug.
 *
 * Derived from Django under BSD-3:
 * <https://github.com/django/django/blob/e9fd2b572410b1236da0d3d0933014138d89f44e/django/utils/text.py>
 *
 * @param {any} name The object to be turned into a slug string
 * @param {Object} options Set options
 * @param {boolean} options.allowUnicode Converts to ASCII if false.
 * @returns {string}
 */
export default function slugify(name, { allowUnicode = false }) {
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
