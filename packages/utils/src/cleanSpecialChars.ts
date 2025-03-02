import type { CleanSpecialCharsOptions } from "@sgcarstrends/types";

export const cleanSpecialChars = (
  value: string,
  options: CleanSpecialCharsOptions = {},
) => {
  const { separator = "", joinSeparator = "" } = options;

  return value
    .split(separator)
    .map((part) => part.trim())
    .join(joinSeparator);
};
