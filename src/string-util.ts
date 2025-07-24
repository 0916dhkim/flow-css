/**
 * Transforms a camel case string to kebab case.
 */
export const camelToKebab = (camelCaseString: string) =>
  camelCaseString
    .split(/(?=[A-Z])/)
    .join("-")
    .toLowerCase();
