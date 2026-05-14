export const getHasFieldChanged = (oldValue: any, newValue: any): boolean => {
  return !deepEqual(oldValue, newValue);
};

export const deepEqual = (a: any, b: any): boolean => {
  // same reference or both primitively equal (string, number, boolean, null, undefined)
  if (a === b) return true;

  // one is null/undefined and the other isn't
  if (a == null || b == null) return false;

  // different types
  if (typeof a !== typeof b) return false;

  // dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // one is array, the other isn't
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
};