/**
 * Safe localStorage wrappers to prevent exceptions when localStorage is disabled or restricted
 * (e.g., iOS Safari Private Browsing).
 */

export const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.warn(`[SafeStorage] Failed to get item '${key}' from localStorage:`, error);
  }
  return null;
};

export const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn(`[SafeStorage] Failed to set item '${key}' in localStorage:`, error);
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`[SafeStorage] Failed to remove item '${key}' from localStorage:`, error);
  }
};
