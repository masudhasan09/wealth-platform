import { describe, it, expect } from 'vitest';
import { parseAndValidateCsv, parseCsvLine, CSV_TEMPLATE_SAMPLE } from './csv-import';

describe('CSV Transaction Import Engine', () => {
  it('parses valid CSV matching the template cleanly', () => {
    const result = parseAndValidateCsv(CSV_TEMPLATE_SAMPLE);

    expect(result.success).toBe(true);
    expect(result.totalRows).toBe(4);
    expect(result.validRows).toHaveLength(4);
    expect(result.errorRows).toHaveLength(0);

    const first = result.validRows[0];
    expect(first.date).toBe('2024-01-15');
    expect(first.account).toBe('Brokerage');
    expect(first.type).toBe('buy');
    expect(first.symbol).toBe('AAPL');
    expect(first.quantity).toBe('10');
    expect(first.price).toBe('185.50');
    expect(first.amount).toBe('1855.00');
    expect(first.note).toBe('Initial Apple purchase');
  });

  it('handles quotes with commas inside values', () => {
    const line = '2024-01-15,Brokerage,buy,AAPL,10,100,1000,0,"Note with, comma and details"';
    const parsed = parseCsvLine(line);
    expect(parsed).toHaveLength(9);
    expect(parsed[8]).toBe('Note with, comma and details');
  });

  it('fails with header error when required columns are missing', () => {
    const badHeaderCsv = 'some_col,another_col\n1,2';
    const result = parseAndValidateCsv(badHeaderCsv);

    expect(result.success).toBe(false);
    expect(result.errorRows).toHaveLength(1);
    expect(result.errorRows[0].errors[0]).toContain('Missing required CSV headers');
  });

  it('flags row-level errors for invalid date, bad type, negative numbers, or zero quantity on buy', () => {
    const testCsv = `date,account,type,symbol,quantity,price,amount,fee,note
bad-date,Brokerage,buy,AAPL,10,100,1000,0,bad date test
2024-01-15,Brokerage,invalid_type,AAPL,10,100,1000,0,bad type
2024-01-15,Brokerage,buy,AAPL,0,100,0,0,zero qty buy
2024-01-15,Brokerage,sell,AAPL,-5,100,500,0,negative qty
2024-01-15,Brokerage,deposit,,0,0,not_a_number,0,bad amount
2024-01-15,Brokerage,deposit,,0,0,1000,0,valid row`;

    const result = parseAndValidateCsv(testCsv);

    expect(result.success).toBe(false);
    expect(result.errorRows).toHaveLength(5);
    expect(result.validRows).toHaveLength(1);

    // Row 2: bad date
    expect(result.errorRows[0].rowNumber).toBe(2);
    expect(result.errorRows[0].errors[0]).toContain('Invalid date format');

    // Row 3: bad type
    expect(result.errorRows[1].rowNumber).toBe(3);
    expect(result.errorRows[1].errors[0]).toContain('Invalid transaction type');

    // Row 4: zero qty on buy
    expect(result.errorRows[2].rowNumber).toBe(4);
    expect(result.errorRows[2].errors[0]).toContain('Quantity must be greater than zero for "buy"');

    // Row 5: negative qty
    expect(result.errorRows[3].rowNumber).toBe(5);
    expect(result.errorRows[3].errors[0]).toContain('Quantity must be a non-negative number');

    // Row 6: bad amount
    expect(result.errorRows[4].rowNumber).toBe(6);
    expect(result.errorRows[4].errors[0]).toContain('Amount must be a non-negative number');

    // Row 7: valid
    expect(result.validRows[0].rowNumber).toBe(7);
  });

  it('detects duplicate transactions against existing database transactions and internal file duplicates', () => {
    const testCsv = `date,account,type,symbol,quantity,price,amount,fee,note
2024-01-15,Brokerage,buy,AAPL,10,100,1000,0,First
2024-01-15,Brokerage,buy,AAPL,10,100,1000,0,Duplicate in same file
2024-02-01,Brokerage,buy,MSFT,5,200,1000,0,Matches existing`;

    const existing = [
      {
        date: '2024-02-01',
        accountName: 'Brokerage',
        type: 'buy',
        symbol: 'MSFT',
        quantity: 5,
        amount: 1000,
      },
    ];

    const result = parseAndValidateCsv(testCsv, existing);

    expect(result.validRows).toHaveLength(3);
    expect(result.validRows[0].isDuplicate).toBe(false);
    expect(result.validRows[1].isDuplicate).toBe(true);
    expect(result.validRows[2].isDuplicate).toBe(true);
    expect(result.duplicateRows).toHaveLength(2);
  });
});
