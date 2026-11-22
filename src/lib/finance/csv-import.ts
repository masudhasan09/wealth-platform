export interface CsvTransactionRow {
  rowNumber: number;
  date: string;
  account: string;
  type: string;
  symbol: string;
  quantity: string;
  price: string;
  amount: string;
  fee: string;
  note: string;
  isDuplicate?: boolean;
}

export interface CsvRowError {
  rowNumber: number;
  raw: string;
  errors: string[];
}

export interface ExistingTransactionMatch {
  date: string | Date;
  accountId?: string;
  accountName?: string;
  type: string;
  symbol?: string | null;
  quantity: string | number;
  amount: string | number;
}

export interface CsvParseResult {
  success: boolean;
  templateFormat: string;
  totalRows: number;
  validRows: CsvTransactionRow[];
  errorRows: CsvRowError[];
  duplicateRows: CsvTransactionRow[];
}

export const CSV_TEMPLATE_HEADER = 'date,account,type,symbol,quantity,price,amount,fee,note';

export const CSV_TEMPLATE_SAMPLE = `${CSV_TEMPLATE_HEADER}
2024-01-15,Brokerage,buy,AAPL,10,185.50,1855.00,0.00,Initial Apple purchase
2024-02-01,Crypto Wallet,buy,BTC,0.05,42000.00,2100.00,5.00,Bitcoin accumulation
2024-03-01,Brokerage,dividend,AAPL,0,0,24.00,0.00,Q1 Dividend
2024-04-10,Checking Account,deposit,,0,0,5000.00,0.00,Monthly transfer`;

const VALID_TRANSACTION_TYPES = new Set([
  'buy',
  'sell',
  'dividend',
  'split',
  'transfer_in',
  'transfer_out',
  'crypto_fee',
  'coupon',
  'maturity',
  'rental_income',
  'property_expense',
  'deposit',
  'withdrawal',
  'interest',
  'fee',
  'reinvestment',
  'return_of_capital',
  'journal',
]);

/**
 * Splits a CSV line taking quoted fields with commas into account.
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses and validates CSV content for financial transactions.
 * Flags row-level errors and detects duplicates against existing transactions or within the file.
 */
export function parseAndValidateCsv(
  csvContent: string,
  existingTransactions: ExistingTransactionMatch[] = []
): CsvParseResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      templateFormat: CSV_TEMPLATE_HEADER,
      totalRows: 0,
      validRows: [],
      errorRows: [{ rowNumber: 1, raw: '', errors: ['CSV content is empty'] }],
      duplicateRows: [],
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => h.toLowerCase());

  const colIdx = {
    date: headers.indexOf('date'),
    account: headers.indexOf('account'),
    type: headers.indexOf('type'),
    symbol: headers.indexOf('symbol'),
    quantity: headers.indexOf('quantity'),
    price: headers.indexOf('price'),
    amount: headers.indexOf('amount'),
    fee: headers.indexOf('fee'),
    note: headers.indexOf('note'),
  };

  if (colIdx.date === -1 || colIdx.type === -1 || colIdx.amount === -1) {
    return {
      success: false,
      templateFormat: CSV_TEMPLATE_HEADER,
      totalRows: lines.length - 1,
      validRows: [],
      errorRows: [
        {
          rowNumber: 1,
          raw: headerLine,
          errors: [
            `Missing required CSV headers. Found: [${headers.join(
              ', '
            )}]. Expected headers must include: date, type, amount (and optionally account, symbol, quantity, price, fee, note).`,
          ],
        },
      ],
      duplicateRows: [],
    };
  }

  const validRows: CsvTransactionRow[] = [];
  const errorRows: CsvRowError[] = [];
  const seenSignatures = new Set<string>();

  // Normalize existing transactions into lookup set
  const existingSet = new Set<string>();
  for (const ex of existingTransactions) {
    const d = new Date(ex.date).toISOString().slice(0, 10);
    const acc = (ex.accountName || ex.accountId || '').toLowerCase().trim();
    const t = ex.type.toLowerCase().trim();
    const sym = (ex.symbol || '').toUpperCase().trim();
    const q = parseFloat(String(ex.quantity || 0)).toFixed(4);
    const a = parseFloat(String(ex.amount || 0)).toFixed(2);
    existingSet.add(`${d}|${acc}|${t}|${sym}|${q}|${a}`);
  }

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const rawLine = lines[i];
    const cells = parseCsvLine(rawLine);
    const errors: string[] = [];

    const dateVal = colIdx.date !== -1 ? cells[colIdx.date] || '' : '';
    const accountVal = colIdx.account !== -1 ? cells[colIdx.account] || '' : '';
    const typeVal = (colIdx.type !== -1 ? cells[colIdx.type] || '' : '').toLowerCase();
    const symbolVal = (colIdx.symbol !== -1 ? cells[colIdx.symbol] || '' : '').toUpperCase();
    const quantityVal = colIdx.quantity !== -1 ? cells[colIdx.quantity] || '0' : '0';
    const priceVal = colIdx.price !== -1 ? cells[colIdx.price] || '0' : '0';
    const amountVal = colIdx.amount !== -1 ? cells[colIdx.amount] || '0' : '0';
    const feeVal = colIdx.fee !== -1 ? cells[colIdx.fee] || '0' : '0';
    const noteVal = colIdx.note !== -1 ? cells[colIdx.note] || '' : '';

    // Validate Date
    if (!dateVal) {
      errors.push('Date is required');
    } else {
      const parsedDate = new Date(dateVal);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Invalid date format "${dateVal}". Use YYYY-MM-DD.`);
      }
    }

    // Validate Type
    if (!typeVal) {
      errors.push('Transaction type is required');
    } else if (!VALID_TRANSACTION_TYPES.has(typeVal)) {
      errors.push(
        `Invalid transaction type "${typeVal}". Must be one of: ${Array.from(
          VALID_TRANSACTION_TYPES
        ).join(', ')}`
      );
    }

    // Validate Numbers
    const numQty = parseFloat(quantityVal);
    if (isNaN(numQty) || numQty < 0) {
      errors.push(`Quantity must be a non-negative number. Got "${quantityVal}".`);
    } else if ((typeVal === 'buy' || typeVal === 'sell') && numQty <= 0) {
      errors.push(`Quantity must be greater than zero for "${typeVal}" transactions.`);
    }

    const numPrice = parseFloat(priceVal);
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push(`Price must be a non-negative number. Got "${priceVal}".`);
    }

    const numAmt = parseFloat(amountVal);
    if (isNaN(numAmt) || numAmt < 0) {
      errors.push(`Amount must be a non-negative number. Got "${amountVal}".`);
    }

    const numFee = parseFloat(feeVal);
    if (isNaN(numFee) || numFee < 0) {
      errors.push(`Fee must be a non-negative number. Got "${feeVal}".`);
    }

    if (errors.length > 0) {
      errorRows.push({
        rowNumber,
        raw: rawLine,
        errors,
      });
      continue;
    }

    // Format normalized date
    const isoDate = new Date(dateVal).toISOString().slice(0, 10);
    const signature = `${isoDate}|${accountVal.toLowerCase()}|${typeVal}|${symbolVal}|${numQty.toFixed(
      4
    )}|${numAmt.toFixed(2)}`;

    let isDuplicate = false;
    if (existingSet.has(signature) || seenSignatures.has(signature)) {
      isDuplicate = true;
    }
    seenSignatures.add(signature);

    validRows.push({
      rowNumber,
      date: isoDate,
      account: accountVal || 'Default',
      type: typeVal,
      symbol: symbolVal,
      quantity: quantityVal,
      price: priceVal,
      amount: amountVal,
      fee: feeVal,
      note: noteVal,
      isDuplicate,
    });
  }

  const duplicateRows = validRows.filter((r) => r.isDuplicate);

  return {
    success: errorRows.length === 0,
    templateFormat: CSV_TEMPLATE_HEADER,
    totalRows: lines.length - 1,
    validRows,
    errorRows,
    duplicateRows,
  };
}

