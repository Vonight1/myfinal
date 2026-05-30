/**
 * Export array of objects to CSV file
 * @param {Array} data - array of objects
 * @param {string} filename - filename without extension
 * @param {Array} columns - [{key, label}] - if not provided, use all keys from first item
 */
export function exportToCSV(data, filename = 'export', columns = null) {
  if (!data || data.length === 0) {
    alert('ບໍ່ມີຂໍ້ມູນ');
    return;
  }

  // ສ້າງ columns ຈາກ first item ຖ້າບໍ່ໄດ້ສົ່ງມາ
  const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));

  // Helper: escape value ສຳລັບ CSV (handle commas, quotes, newlines)
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Header row
  const header = cols.map(c => escape(c.label)).join(',');

  // Data rows
  const rows = data.map(item =>
    cols.map(c => {
      const val = c.format ? c.format(item[c.key], item) : item[c.key];
      return escape(val);
    }).join(',')
  );

  // BOM (﻿) ສຳລັບ UTF-8 ໃຫ້ Excel ອ່ານພາສາລາວໄດ້
  const csv = '﻿' + header + '\n' + rows.join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.download = `${filename}_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for CSV
 */
export const formatDateCSV = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('lo-LA');
};

/**
 * Format boolean for CSV
 */
export const formatBoolCSV = (val) => val ? 'ແມ່ນ' : 'ບໍ່';
