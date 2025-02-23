export interface CleanSpecialCharsOptions {
  separator?: string;
  joinSeparator?: string;
}

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
