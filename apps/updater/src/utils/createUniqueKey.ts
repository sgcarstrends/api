/**
 * Creates a unique key by concatenating specified fields from a record.
 *
 * @param record The input record from which to extract values
 * @param keyFields An array of fields to use for creating the unique key
 * @returns A string key created by joining the values of the specified fields with a hyphen
 *
 * @example
 * const user = { id: 1, name: 'John', email: 'john@example.com' }
 * const uniqueKey = createUniqueKey(user, ['id', 'name'])
 * // Returns: "1-John"
 */
export const createUniqueKey = <T>(record: Record<any, any>, keyFields: T[]) =>
  keyFields.map((field) => record[field]).join("-");
