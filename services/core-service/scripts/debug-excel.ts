import * as XLSX from 'xlsx';
import * as path from 'path';

const tt133File = path.join(
  __dirname,
  '..',
  'src',
  'modules',
  'chart-of-accounts',
  'he-thong-tai-khoan-ke-toan-tt-133.xlsx',
);
const workbook = XLSX.readFile(tt133File);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('First 30 rows of TT-133 file:');
console.log('================================\n');

for (let i = 0; i < Math.min(30, data.length); i++) {
  const row = data[i] as any[];
  console.log(`Row ${i}:`, row);
}
