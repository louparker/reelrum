/**
 * Utility functions for safely handling URL parameters and form data
 * in a way that's compatible with Next.js 14's async data requirements
 */

/**
 * Safely extracts a string parameter from searchParams or formData
 * @param source The searchParams or formData object
 * @param key The parameter key to extract
 * @param defaultValue Optional default value if parameter is missing
 * @returns The parameter value as a string, or the default value
 */
export function getStringParam(
  source: { [key: string]: string | string[] | undefined } | FormData,
  key: string,
  defaultValue: string | null = null
): string | null {
  if (source instanceof FormData) {
    const value = source.get(key);
    if (value === null) return defaultValue;
    return typeof value === 'string' ? value : defaultValue;
  }
  
  // For searchParams, use optional chaining to avoid direct property access
  // This is compatible with Next.js 14's dynamic API requirements
  if (key in source) {
    const value = source[key];
    if (value === undefined) return defaultValue;
    return typeof value === 'string' ? value : defaultValue;
  }
  return defaultValue;
}

/**
 * Safely extracts a boolean parameter from searchParams or formData
 * @param source The searchParams or formData object
 * @param key The parameter key to extract
 * @param defaultValue Optional default value if parameter is missing
 * @returns The parameter value as a boolean, or the default value
 */
export function getBooleanParam(
  source: { [key: string]: string | string[] | undefined } | FormData,
  key: string,
  defaultValue: boolean = false
): boolean {
  if (source instanceof FormData) {
    const value = source.get(key);
    if (value === null) return defaultValue;
    return value === 'true' || value === '1' || value === 'yes';
  }
  
  // For searchParams, use optional chaining to avoid direct property access
  if (key in source) {
    const value = source[key];
    if (value === undefined) return defaultValue;
    if (typeof value === 'string') {
      return value === 'true' || value === '1' || value === 'yes';
    }
  }
  return defaultValue;
}

/**
 * Safely extracts a number parameter from searchParams or formData
 * @param source The searchParams or formData object
 * @param key The parameter key to extract
 * @param defaultValue Optional default value if parameter is missing or invalid
 * @returns The parameter value as a number, or the default value
 */
export function getNumberParam(
  source: { [key: string]: string | string[] | undefined } | FormData,
  key: string,
  defaultValue: number | null = null
): number | null {
  if (source instanceof FormData) {
    const value = source.get(key);
    if (value === null) return defaultValue;
    if (typeof value !== 'string') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  
  // For searchParams, use optional chaining to avoid direct property access
  if (key in source) {
    const value = source[key];
    if (value === undefined) return defaultValue;
    if (typeof value === 'string') {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    }
  }
  return defaultValue;
}

/**
 * Safely extracts an array parameter from searchParams
 * @param source The searchParams object
 * @param key The parameter key to extract
 * @returns The parameter value as an array of strings
 */
export function getArrayParam(
  source: { [key: string]: string | string[] | undefined },
  key: string
): string[] {
  // For searchParams, use optional chaining to avoid direct property access
  if (key in source) {
    const value = source[key];
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }
  return [];
}
