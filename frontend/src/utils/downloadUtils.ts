// Utility functions for downloading graph data in various formats

export interface GraphData {
  [key: string]: any;
}

export type DownloadFormat = 'csv' | 'json' | 'excel';

/**
 * Convert array of objects to CSV format
 */
export const convertToCSV = (data: GraphData[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download data as a file
 */
export const downloadFile = (
  content: string, 
  filename: string, 
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  window.URL.revokeObjectURL(url);
};

/**
 * Download graph data in specified format
 */
export const downloadGraphData = (
  data: GraphData[], 
  filename: string, 
  format: DownloadFormat = 'csv'
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = `${filename}_${timestamp}`;
  
  switch (format) {
    case 'csv':
      const csvContent = convertToCSV(data);
      downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'json':
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, `${baseFilename}.json`, 'application/json');
      break;
      
    case 'excel':
      // For Excel format, we'll use CSV with UTF-8 BOM for better Excel compatibility
      const excelContent = '\ufeff' + convertToCSV(data);
      downloadFile(excelContent, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

/**
 * Generate filename based on graph type and current date
 */
export const generateFilename = (graphType: string): string => {
  const sanitized = graphType.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${sanitized}_data`;
};