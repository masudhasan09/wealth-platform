/**
 * Prisma seed script — populates a demo user and a small sample portfolio
 * covering all five asset classes.
 *
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function demoHash(password: string): string {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // -------------------------------------------------------------------------
  // Demo user
  // -------------------------------------------------------------------------
  const user = await prisma.user.upsert({
    where: { email: 'demo@wealthtrack.dev' },
    update: {
      passwordHash: demoHash('demo1234'),
    },
    create: {
      email: 'demo@wealthtrack.dev',
      name: 'Demo User',
      passwordHash: demoHash('demo1234'),
    },
  });
  console.log(`  ✓ User: ${user.email}`);

  // -------------------------------------------------------------------------
  // Instruments — one per asset class
  // -------------------------------------------------------------------------
  const aapl = await prisma.instrument.upsert({
    where: { id: 'inst-aapl' },
    update: {},
    create: {
      id: 'inst-aapl',
      assetClass: 'equity',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currency: 'USD',
    },
  });

  const btc = await prisma.instrument.upsert({
    where: { id: 'inst-btc' },
    update: {},
    create: {
      id: 'inst-btc',
      assetClass: 'crypto',
      symbol: 'BTC',
      name: 'Bitcoin',
      currency: 'USD',
    },
  });

  const tbond = await prisma.instrument.upsert({
    where: { id: 'inst-tbond' },
    update: {
      symbol: 'UST-4Y',
    },
    create: {
      id: 'inst-tbond',
      assetClass: 'fixed_income',
      symbol: 'UST-4Y',
      name: 'US Treasury Note 4% 2028',
      currency: 'USD',
    },
  });
  await prisma.bondDetails.upsert({
    where: { instrumentId: 'inst-tbond' },
    update: {},
    create: {
      instrumentId: 'inst-tbond',
      faceValue: '1000',
      couponRate: '0.04',
      couponFrequency: 'semi_annual',
      maturityDate: new Date('2028-05-15'),
      issueDate: new Date('2023-05-15'),
      dayCount: 'actual_actual',
    },
  });

  const property = await prisma.instrument.upsert({
    where: { id: 'inst-prop' },
    update: {},
    create: {
      id: 'inst-prop',
      assetClass: 'real_estate',
      symbol: null,
      name: '123 Main St, Austin TX',
      currency: 'USD',
    },
  });
  await prisma.propertyDetails.upsert({
    where: { instrumentId: 'inst-prop' },
    update: {},
    create: {
      instrumentId: 'inst-prop',
      address: '123 Main St, Austin, TX 78701',
      purchasePrice: '450000',
      purchaseDate: new Date('2021-06-01'),
      ownershipPct: '1',
      propertyType: 'residential',
    },
  });

  const cash = await prisma.instrument.upsert({
    where: { id: 'inst-cash-usd' },
    update: {},
    create: {
      id: 'inst-cash-usd',
      assetClass: 'cash',
      symbol: 'USD',
      name: 'US Dollar Cash',
      currency: 'USD',
    },
  });

  console.log('  ✓ Instruments created');

  // -------------------------------------------------------------------------
  // Accounts
  // -------------------------------------------------------------------------
  const brokerage = await prisma.account.upsert({
    where: { id: 'acct-brokerage' },
    update: {},
    create: {
      id: 'acct-brokerage',
      userId: user.id,
      name: 'Taxable Brokerage',
      type: 'brokerage',
      currency: 'USD',
    },
  });

  const cryptoWallet = await prisma.account.upsert({
    where: { id: 'acct-crypto' },
    update: {},
    create: {
      id: 'acct-crypto',
      userId: user.id,
      name: 'Crypto Wallet',
      type: 'crypto_wallet',
      currency: 'USD',
    },
  });

  const ira = await prisma.account.upsert({
    where: { id: 'acct-ira' },
    update: {},
    create: {
      id: 'acct-ira',
      userId: user.id,
      name: 'Traditional IRA',
      type: 'ira',
      currency: 'USD',
    },
  });

  const propAccount = await prisma.account.upsert({
    where: { id: 'acct-property' },
    update: {},
    create: {
      id: 'acct-property',
      userId: user.id,
      name: 'Real Estate',
      type: 'property',
      currency: 'USD',
    },
  });

  const bank = await prisma.account.upsert({
    where: { id: 'acct-bank' },
    update: {},
    create: {
      id: 'acct-bank',
      userId: user.id,
      name: 'Checking & Savings',
      type: 'bank',
      currency: 'USD',
    },
  });

  console.log('  ✓ Accounts created');

  // -------------------------------------------------------------------------
  // Transactions (immutable ledger)
  // -------------------------------------------------------------------------
  // Initial account funding deposits
  await prisma.transaction.upsert({
    where: { id: 'tx-brokerage-deposit-1' },
    update: {},
    create: {
      id: 'tx-brokerage-deposit-1',
      accountId: brokerage.id,
      instrumentId: cash.id,
      type: 'deposit',
      date: new Date('2023-01-01'),
      quantity: '25000',
      price: '1',
      amount: '25000',
      fee: '0',
      note: 'Initial brokerage deposit',
    },
  });

  await prisma.transaction.upsert({
    where: { id: 'tx-crypto-deposit-1' },
    update: {},
    create: {
      id: 'tx-crypto-deposit-1',
      accountId: cryptoWallet.id,
      instrumentId: cash.id,
      type: 'deposit',
      date: new Date('2023-01-01'),
      quantity: '10000',
      price: '1',
      amount: '10000',
      fee: '0',
      note: 'Initial crypto funding',
    },
  });

  await prisma.transaction.upsert({
    where: { id: 'tx-ira-deposit-1' },
    update: {},
    create: {
      id: 'tx-ira-deposit-1',
      accountId: ira.id,
      instrumentId: cash.id,
      type: 'deposit',
      date: new Date('2023-01-01'),
      quantity: '10000',
      price: '1',
      amount: '10000',
      fee: '0',
      note: '2023 IRA contribution',
    },
  });

  // Equity buys
  await prisma.transaction.upsert({
    where: { id: 'tx-aapl-buy-1' },
    update: {},
    create: {
      id: 'tx-aapl-buy-1',
      accountId: brokerage.id,
      instrumentId: aapl.id,
      type: 'buy',
      date: new Date('2023-01-15'),
      quantity: '50',
      price: '130.28',
      amount: '6514.00',
      fee: '0',
    },
  });
  await prisma.transaction.upsert({
    where: { id: 'tx-aapl-buy-2' },
    update: {},
    create: {
      id: 'tx-aapl-buy-2',
      accountId: brokerage.id,
      instrumentId: aapl.id,
      type: 'buy',
      date: new Date('2023-06-20'),
      quantity: '25',
      price: '186.01',
      amount: '4650.25',
      fee: '0',
    },
  });
  await prisma.transaction.upsert({
    where: { id: 'tx-aapl-div-1' },
    update: {},
    create: {
      id: 'tx-aapl-div-1',
      accountId: brokerage.id,
      instrumentId: aapl.id,
      type: 'dividend',
      date: new Date('2023-08-17'),
      quantity: '0',
      price: '0',
      amount: '23.75',
      fee: '0',
      note: 'Q3 2023 dividend $0.24/share',
    },
  });

  // Crypto buy
  await prisma.transaction.upsert({
    where: { id: 'tx-btc-buy-1' },
    update: {},
    create: {
      id: 'tx-btc-buy-1',
      accountId: cryptoWallet.id,
      instrumentId: btc.id,
      type: 'buy',
      date: new Date('2023-03-10'),
      quantity: '0.25',
      price: '22400.00',
      amount: '5600.00',
      fee: '28.00',
    },
  });

  // Fixed income buy
  await prisma.transaction.upsert({
    where: { id: 'tx-tbond-buy-1' },
    update: {},
    create: {
      id: 'tx-tbond-buy-1',
      accountId: ira.id,
      instrumentId: tbond.id,
      type: 'buy',
      date: new Date('2023-06-01'),
      quantity: '5',
      price: '980.00',
      amount: '4900.00',
      fee: '0',
      note: '5 bonds @ 98 (face $1,000 each)',
    },
  });

  // Fixed income semiannual coupon payment ($100 = 5 bonds * $1000 * 4% / 2)
  await prisma.transaction.upsert({
    where: { id: 'tx-tbond-coupon-1' },
    update: {},
    create: {
      id: 'tx-tbond-coupon-1',
      accountId: ira.id,
      instrumentId: tbond.id,
      type: 'coupon',
      date: new Date('2023-11-15'),
      quantity: '0',
      price: '0',
      amount: '100.00',
      fee: '0',
      note: 'Semiannual coupon payment 5x $20.00',
    },
  });

  // NOTE: Real estate property acquisition is tracked via PropertyDetails + ValuationMark,
  // NOT as a cash-depleting buy transaction. The mortgage liability covers the financing.
  // We intentionally do NOT create a 'buy' transaction for the property purchase to avoid
  // incorrectly draining the cash balance by $450k.

  // Cash deposit
  await prisma.transaction.upsert({
    where: { id: 'tx-cash-deposit-1' },
    update: {},
    create: {
      id: 'tx-cash-deposit-1',
      accountId: bank.id,
      instrumentId: cash.id,
      type: 'deposit',
      date: new Date('2023-01-01'),
      quantity: '25000',
      price: '1',
      amount: '25000',
      fee: '0',
      note: 'Initial deposit',
    },
  });

  console.log('  ✓ Transactions created');

  // -------------------------------------------------------------------------
  // Prices (cached market prices)
  // -------------------------------------------------------------------------
  const priceDate = new Date('2024-01-02');

  await prisma.price.upsert({
    where: { instrumentId_date_source: { instrumentId: aapl.id, date: priceDate, source: 'manual' } },
    update: {},
    create: {
      instrumentId: aapl.id,
      date: priceDate,
      value: '185.92',
      source: 'manual',
      asOf: priceDate,
      method: 'manual',
    },
  });

  await prisma.price.upsert({
    where: { instrumentId_date_source: { instrumentId: btc.id, date: priceDate, source: 'manual' } },
    update: {},
    create: {
      instrumentId: btc.id,
      date: priceDate,
      value: '44200.00',
      source: 'manual',
      asOf: priceDate,
      method: 'manual',
    },
  });

  await prisma.price.upsert({
    where: { instrumentId_date_source: { instrumentId: tbond.id, date: priceDate, source: 'manual' } },
    update: {},
    create: {
      instrumentId: tbond.id,
      date: priceDate,
      value: '975.00',
      source: 'manual',
      asOf: priceDate,
      method: 'model',
    },
  });

  // Property valuation mark
  await prisma.valuationMark.upsert({
    where: { id: 'vm-prop-2024' },
    update: {},
    create: {
      id: 'vm-prop-2024',
      instrumentId: property.id,
      date: priceDate,
      value: '520000',
      method: 'manual',
      note: 'Zillow estimate Jan 2024',
    },
  });

  // Property mortgage liability
  await prisma.liability.upsert({
    where: { id: 'liab-mortgage' },
    update: {},
    create: {
      id: 'liab-mortgage',
      accountId: propAccount.id,
      linkedInstrumentId: property.id,
      name: 'Home Mortgage',
      principal: '340000',
      rate: '0.0375',
      termMonths: 360,
      startDate: new Date('2021-06-01'),
    },
  });

  // Tax lots for equity buys
  await prisma.taxLot.upsert({
    where: { id: 'lot-aapl-1' },
    update: {},
    create: {
      id: 'lot-aapl-1',
      transactionId: 'tx-aapl-buy-1',
      quantity: '50',
      costBasisPerUnit: '130.28',
      openDate: new Date('2023-01-15'),
    },
  });
  await prisma.taxLot.upsert({
    where: { id: 'lot-aapl-2' },
    update: {},
    create: {
      id: 'lot-aapl-2',
      transactionId: 'tx-aapl-buy-2',
      quantity: '25',
      costBasisPerUnit: '186.01',
      openDate: new Date('2023-06-20'),
    },
  });
  await prisma.taxLot.upsert({
    where: { id: 'lot-btc-1' },
    update: {},
    create: {
      id: 'lot-btc-1',
      transactionId: 'tx-btc-buy-1',
      quantity: '0.25',
      costBasisPerUnit: '22400',
      openDate: new Date('2023-03-10'),
    },
  });

  console.log('  ✓ Prices, valuations and tax lots created');
  console.log('\n✅ Seed complete! Demo credentials: demo@wealthtrack.dev / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
