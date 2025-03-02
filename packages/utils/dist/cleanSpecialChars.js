export const cleanSpecialChars = (value, options = {}) => {
    const { separator = "", joinSeparator = "" } = options;
    return value
        .split(separator)
        .map((part) => part.trim())
        .join(joinSeparator);
};
