import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface AccountRow {
  accountNumber: string;
  accountName: string;
  accountNameEn?: string;
  accountNature: 'debit' | 'credit' | 'both';
  accountLevel: number;
  parentAccountNumber?: string;
  description?: string;
  characteristics?: string;
}

function determineAccountLevel(accountNumber: string): number {
  const length = accountNumber.length;
  if (length === 1) return 1;
  if (length === 2) return 2;
  if (length === 3) return 3;
  if (length === 4) return 4;
  return Math.ceil(length / 2);
}

function findParentAccountNumber(accountNumber: string): string | null {
  const length = accountNumber.length;
  if (length <= 1) return null;

  // Parent is the account number minus last digit/character
  return accountNumber.substring(0, length - 1);
}

function determineAccountNature(
  accountNumber: string,
): 'debit' | 'credit' | 'both' {
  const firstDigit = accountNumber.charAt(0);

  // Based on Vietnamese Accounting Standards (Circular 200 & 133)
  // Class 1-5: Assets and Expenses (Debit)
  // Class 6-9: Liabilities, Equity, Revenue (Credit)

  if (['1', '2'].includes(firstDigit)) return 'debit'; // Assets
  if (['3', '4'].includes(firstDigit)) return 'credit'; // Liabilities & Equity
  if (firstDigit === '5') return 'debit'; // Cost of Goods Sold
  if (['6', '7', '8'].includes(firstDigit)) return 'debit'; // Expenses
  if (firstDigit === '9') return 'credit'; // Revenue

  return 'both'; // Default
}

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

function parseExcelFile(filePath: string, accountingRegime: '200' | '133'): AccountRow[] {
  console.log(`\n📖 Reading Excel file: ${filePath}`);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`📊 Total rows: ${data.length}`);

  const accounts: AccountRow[] = [];

  // Check file structure
  if (accountingRegime === '200') {
    // TT-200 format: columns are [Level1, Level2, Level3?, AccountName]
    // Header at row 5: "Cấp 1", "Cấp 2", "TÊN TÀI KHOẢN"
    console.log('📐 Using TT-200 format (columnar structure)');

    for (let i = 7; i < data.length; i++) {
      const row = data[i] as any[];

      if (!row || row.length === 0) continue;

      // Find account number (first non-empty numeric cell)
      let accountNumber: string | null = null;
      let accountNumberCol = -1;

      for (let col = 0; col < Math.min(5, row.length); col++) {
        const val = row[col];
        if (val && /^\d+$/.test(val.toString())) {
          accountNumber = val.toString().trim();
          accountNumberCol = col;
          break;
        }
      }

      if (!accountNumber) continue;

      // Find account name (last non-empty cell or after account number)
      let accountName: string | null = null;

      for (let col = accountNumberCol + 1; col < row.length; col++) {
        const val = row[col];
        if (val && val.toString().trim() && !val.toString().includes('LOẠI TÀI KHOẢN')) {
          accountName = val.toString().trim();
          break;
        }
      }

      if (!accountName) {
        // Try to find in next columns
        for (let col = 0; col < row.length; col++) {
          const val = row[col];
          if (
            val &&
            typeof val === 'string' &&
            val.trim() &&
            !/^\d+$/.test(val) &&
            !val.includes('LOẠI TÀI KHOẢN')
          ) {
            accountName = val.trim();
            break;
          }
        }
      }

      if (!accountName) {
        console.log(`⏭️  Skipping row ${i}: No account name found for ${accountNumber}`);
        continue;
      }

      const accountLevel = determineAccountLevel(accountNumber);
      const parentAccountNumber = findParentAccountNumber(accountNumber) || undefined;
      const accountNature = determineAccountNature(accountNumber);

      accounts.push({
        accountNumber,
        accountName,
        accountNature,
        accountLevel,
        parentAccountNumber,
      });
    }
  } else {
    // TT-133 format: columns are [STT, Level1 Account, Level2 Account, AccountName]
    // Data starts at row 4
    console.log('📐 Using TT-133 format (columnar table structure)');

    for (let i = 4; i < data.length; i++) {
      const row = data[i] as any[];

      if (!row || row.length === 0) continue;

      // Find account number (check columns 1 and 2)
      let accountNumber: string | null = null;

      // Check column 1 (Level 1 accounts like 111, 112, etc.)
      if (row[1] && /^\d+$/.test(row[1].toString().trim())) {
        accountNumber = row[1].toString().trim();
      }
      // Check column 2 (Level 2 accounts like 1111, 1112, etc.)
      else if (row[2] && /^\d+$/.test(row[2].toString().trim())) {
        accountNumber = row[2].toString().trim();
      }

      if (!accountNumber) continue;

      // Account name is in column 3
      const accountName = row[3]?.toString().trim();

      if (!accountName || accountName.includes('LOẠI TÀI KHOẢN')) {
        continue;
      }

      const accountLevel = determineAccountLevel(accountNumber);
      const parentAccountNumber = findParentAccountNumber(accountNumber) || undefined;
      const accountNature = determineAccountNature(accountNumber);

      accounts.push({
        accountNumber,
        accountName,
        accountNature,
        accountLevel,
        parentAccountNumber,
      });
    }
  }

  console.log(`✅ Parsed ${accounts.length} accounts from ${filePath}`);
  return accounts;
}

function generateSQL(accounts: AccountRow[], accountingRegime: '200' | '133'): string {
  const sqlStatements: string[] = [];

  sqlStatements.push(`-- Migration: Seed Chart of Accounts for Circular ${accountingRegime}`);
  sqlStatements.push(`-- Generated at: ${new Date().toISOString()}`);
  sqlStatements.push(`-- Total accounts: ${accounts.length}`);
  sqlStatements.push('');
  sqlStatements.push(`-- Delete existing accounts for regime '${accountingRegime}'`);
  sqlStatements.push(
    `DELETE FROM chart_of_accounts_general WHERE accounting_regime = '${accountingRegime}';`,
  );
  sqlStatements.push('');

  // Sort by account level first, then account number
  const sortedAccounts = accounts.sort((a, b) => {
    if (a.accountLevel !== b.accountLevel) {
      return a.accountLevel - b.accountLevel;
    }
    return a.accountNumber.localeCompare(b.accountNumber);
  });

  // Group by level
  const accountsByLevel = sortedAccounts.reduce(
    (acc, account) => {
      if (!acc[account.accountLevel]) {
        acc[account.accountLevel] = [];
      }
      acc[account.accountLevel].push(account);
      return acc;
    },
    {} as Record<number, AccountRow[]>,
  );

  // Generate INSERT statements by level
  Object.keys(accountsByLevel)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((level) => {
      const levelAccounts = accountsByLevel[parseInt(level)];

      sqlStatements.push(`-- Level ${level} Accounts (${levelAccounts.length} accounts)`);
      sqlStatements.push(`INSERT INTO chart_of_accounts_general (`);
      sqlStatements.push(`  account_number,`);
      sqlStatements.push(`  account_name,`);
      sqlStatements.push(`  account_name_en,`);
      sqlStatements.push(`  account_nature,`);
      sqlStatements.push(`  account_level,`);
      sqlStatements.push(`  parent_account_number,`);
      sqlStatements.push(`  description,`);
      sqlStatements.push(`  accounting_regime,`);
      sqlStatements.push(`  active`);
      sqlStatements.push(`) VALUES`);

      const values = levelAccounts.map((account, index) => {
        const isLast = index === levelAccounts.length - 1;

        const accountNameEn = account.accountNameEn
          ? `'${escapeSQL(account.accountNameEn)}'`
          : 'NULL';
        const parentAccountNumber = account.parentAccountNumber
          ? `'${account.parentAccountNumber}'`
          : 'NULL';
        const description = account.description ? `'${escapeSQL(account.description)}'` : 'NULL';

        return `  ('${account.accountNumber}', '${escapeSQL(account.accountName)}', ${accountNameEn}, '${account.accountNature}', ${account.accountLevel}, ${parentAccountNumber}, ${description}, '${accountingRegime}', true)${isLast ? ';' : ','}`;
      });

      sqlStatements.push(...values);
      sqlStatements.push('');
    });

  return sqlStatements.join('\n');
}

// Main execution
async function main() {
  console.log('🚀 Starting Chart of Accounts Excel Parser');
  console.log('==========================================\n');

  const baseDir = path.join(__dirname, '..', 'src', 'modules', 'chart-of-accounts');
  const outputDir = path.join(__dirname, '..', 'migrations');

  // Parse TT-200 (Circular 200)
  const tt200File = path.join(baseDir, 'He-thong-Tai-khoan-ke-toan-theo-TT-200.xlsx');
  const tt200Accounts = parseExcelFile(tt200File, '200');
  const tt200SQL = generateSQL(tt200Accounts, '200');

  const tt200OutputFile = path.join(outputDir, '002_seed_chart_of_accounts_tt200.sql');
  fs.writeFileSync(tt200OutputFile, tt200SQL, 'utf-8');
  console.log(`✅ Generated SQL for TT-200: ${tt200OutputFile}`);
  console.log(`   Total accounts: ${tt200Accounts.length}\n`);

  // Parse TT-133 (Circular 133)
  const tt133File = path.join(baseDir, 'he-thong-tai-khoan-ke-toan-tt-133.xlsx');
  const tt133Accounts = parseExcelFile(tt133File, '133');
  const tt133SQL = generateSQL(tt133Accounts, '133');

  const tt133OutputFile = path.join(outputDir, '002_seed_chart_of_accounts_tt133.sql');
  fs.writeFileSync(tt133OutputFile, tt133SQL, 'utf-8');
  console.log(`✅ Generated SQL for TT-133: ${tt133OutputFile}`);
  console.log(`   Total accounts: ${tt133Accounts.length}\n`);

  console.log('==========================================');
  console.log('✨ Done! SQL migration files generated successfully.');
  console.log('\n📝 Next steps:');
  console.log('1. Review the generated SQL files in migrations/');
  console.log('2. Run the migrations to populate the database');
  console.log('3. Test the chart of accounts initialization');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
