// Derived from https://github.com/luvies/format-list

const escapeRe = /[.*+?^${}()|[\]\\]/g;
const escapeReSymbols = (s: string) => s.replace(escapeRe, "\\$&");

/**
 * The spec of the options object used to configure custom starting points
 * for the list and `$n` tags.
 */
export interface Options {
  /**
   * The string that prefixes the tag.
   * @default '$'
   */
  tagStr?: string;
  /**
   * The number to start with for the $n tags.
   * @default 0 // i.e. $0
   */
  tagStart?: number;
  /**
   * The index to start with for the list replacement.
   * @default 0 // i.e. the value of index 0 is replaces the first tag.
   */
  indexStart?: number;
}

/**
 * Formats a list of values into a given string using the `$n` tags.
 * By default, index 0 will replace the `$0` tag, and it will go up
 * by 1 from there.
 *
 * @param str The string to format.
 * @param lst The list to get the values from.
 * @param opts The options for use for the formatting.
 * @returns The formatted string.
 */
export function formatList(
  str: string,
  lst: readonly string[],
  opts?: Options,
): string {
  if (lst.length === 0) {
    return str;
  }

  const tagStr = opts?.tagStr ?? "$";
  const tagStart = opts?.tagStart ?? 0;
  const indexStart = opts?.indexStart ?? 0;

  const rpl: Record<string, string> = {};
  for (let i = indexStart; i < lst.length; i++) {
    rpl[`${tagStr}${i + tagStart - indexStart}`] = lst[i];
  }

  const keys = Object.keys(rpl).map(escapeReSymbols);

  if (keys.length === 0) {
    return str;
  }

  const search = new RegExp(keys.join("|"), "g");
  return str.replace(search, (match) => rpl[match]);
}
