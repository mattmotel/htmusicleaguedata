/**
 * Proper CSV parser that handles multi-line fields within quotes
 * This fixes the issue where comments with newlines were breaking the CSV structure
 */

export function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let current = '';
  let inQuotes = false;
  let previousChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"' && previousChar !== '\\') {
      inQuotes = !inQuotes;
      current += char;
      previousChar = char;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      currentRow.push(current.trim());
      current = '';
      previousChar = char;
      continue;
    }
    
    if ((char === '\n' || char === '\r') && !inQuotes) {
      currentRow.push(current.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      current = '';
      previousChar = char;
      continue;
    }
    
    current += char;
    previousChar = char;
  }
  
  // Handle last field if no newline at end
  if (current.trim() || currentRow.length > 0) {
    currentRow.push(current.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }
  
  return rows;
}

/**
 * Parse a single CSV line (for simple cases)
 */
export function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let previousChar = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"' && previousChar !== '\\') {
      inQuotes = !inQuotes;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    
    if ((char === '\n' || char === '\r') && !inQuotes) {
      continue;
    }
    
    current += char;
    previousChar = char;
  }
  
  if (current) {
    result.push(current.trim());
  }
  
  return result.map(field => 
    field.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
  );
}
