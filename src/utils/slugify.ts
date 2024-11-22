/**
 * Converts a string into a URL-friendly slug
 *
 * @param {string} str - The string to be converted into a slug
 * @returns {string} The slugified string
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
 * @param {string} slug - The slug to be converted back to a title
 * @returns {string} The readable title
 */
export const deslugify = (slug: string): string => {
  return slug
    .trim()
    .toLowerCase()
    .replace(/-+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};
