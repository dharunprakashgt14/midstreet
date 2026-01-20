/**
 * Table configuration for the restaurant ordering system.
 * 
 * TODO: This will be moved to backend configuration when API integration is added.
 * QR codes will map to /table/:tableId routes using this maxTables value.
 */
export const MAX_TABLES = 9;

/**
 * Validates if a table number is within the allowed range.
 * @param tableId - The table number to validate
 * @returns true if the table number is valid (1 to MAX_TABLES)
 */
export const isValidTableId = (tableId: number): boolean => {
  return Number.isInteger(tableId) && tableId >= 1 && tableId <= MAX_TABLES;
};












