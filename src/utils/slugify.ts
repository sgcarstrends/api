/**
 * Converts a string into a URL-friendly slug
 *
 * @param {string} str - The string to be converted into a slug
 * @returns {string} The slugified string
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+)|(-+$)/g, "");
};

/**
 * Converts a slug back to a readable title (basic version)
 *
 * @param {string} slug - The slug to be converted back to a title
 * @returns {string} The readable title
 */
export const deslugify = (slug: string): string => {
  return slug
    .replace(/-+/g, "-")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};
