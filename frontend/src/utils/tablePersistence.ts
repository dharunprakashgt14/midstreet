/**
 * Table Persistence Utility
 * 
 * Stores and retrieves the selected table number in localStorage
 * to persist across page refreshes and logouts.
 */

const STORAGE_KEY = 'midstreet_selected_table';

/**
 * Get the stored table number from localStorage
 * @returns Table number (1-9) or null if not set
 */
export const getStoredTable = (): number | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const tableNumber = Number(stored);
    // Validate table number is between 1 and 9
    if (tableNumber >= 1 && tableNumber <= 9) {
      return tableNumber;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Store the table number in localStorage
 * @param tableNumber Table number (1-9)
 */
export const storeTable = (tableNumber: number): void => {
  try {
    if (tableNumber >= 1 && tableNumber <= 9) {
      window.localStorage.setItem(STORAGE_KEY, String(tableNumber));
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Clear the stored table number
 */
export const clearStoredTable = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};





