/**
 * Converts a string into a URL-friendly slug
 *
 * @param str - The string to be converted into a slug
 * @returns The slugified string
 */
export const slugify = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\W_]+/g, "-");
};

/**
 * Converts a slug back to a readable title
 *
 * @param slug - The slug to be converted back to a title
 * @returns The readable title
 */
export const deslugify = (slug: string): string => {
  return slug
    .trim()
    .toLowerCase()
    .replace(/-+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};
