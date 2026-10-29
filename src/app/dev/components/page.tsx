'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Label,
  Icon,
  Text,
  Heading,
  Badge,
  Avatar,
  Spinner,
  Skeleton,
  Divider,
  FileInput,
  MoneyText,
  PercentText,
  DateText,
} from '@/components/atoms';
import {
  FormField,
  CardHeader,
  StatCard,
  Alert,
  EmptyState,
  DisclaimerNotice,
  GainLossIndicator,
  FreshnessBadge,
  AssetClassTag,
  SearchBox,
  InputGroup,
  CurrencyInput,
  Pagination,
  NavItem,
  UserInfo,
  ChartContainer,
  ConfirmDialog,
  Stepper,
  Tabs,
  LogoutButton,
} from '@/components/molecules';
import {
  DataTable,
  AccountList,
  TransactionTable,
  HoldingsTable,
  BondDetailsPanel,
  CouponScheduleTable,
  MaturityLadder,
  DashboardSection,
  AllocationChart,
  IncomeChart,
  PerformancePanel,
  TopHoldings,
  PropertyForm,
  ValuationHistory,
  MortgagePanel,
  AmortizationTable,
  TaxLotTable,
  RealizedGainsReport,
  RiskPanel,
} from '@/components/organisms';

export default function ComponentGalleryPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12 bg-background min-h-screen text-text">
      <div>
        <Heading level="h1">Component Design System Gallery</Heading>
        <Text variant="body" tone="muted" className="mt-2">
          Development-only visual showcase for every atom and molecule in the WealthTrack Atomic Design System.
        </Text>
      </div>

      <Divider />

      {/* ================= ATOMS ================= */}
      <section className="space-y-8">
        <Heading level="h2">Atoms</Heading>

        {/* Buttons */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">Button</Heading>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Primary SM</Button>
            <Button variant="primary" size="md">Primary MD</Button>
            <Button variant="primary" size="lg">Primary LG</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="danger" size="md">Danger</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </div>

        {/* Inputs & Form Controls */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">Input, Select, Textarea, Checkbox, Label</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-input-sm">Stock Symbol (Small / &quot;SM&quot; — 32px height for compact tables)</Label>
              <Input id="demo-input-sm" size="sm" placeholder="e.g. AAPL, NVDA, MSFT" />
            </div>
            <div>
              <Label htmlFor="demo-input-md">Account Name (Medium / &quot;MD&quot; — 40px standard form height)</Label>
              <Input id="demo-input-md" size="md" placeholder="e.g. Vanguard 401(k), Fidelity Brokerage" />
            </div>
            <div>
              <Label htmlFor="demo-input-error">Share Price (Example Error State)</Label>
              <Input id="demo-input-error" error placeholder="e.g. 185.50" defaultValue="Invalid negative price: -$15.00" />
            </div>
            <div>
              <Label htmlFor="demo-select">Asset Class (Dropdown Select)</Label>
              <Select id="demo-select" defaultValue="equity">
                <option value="equity">Equity (e.g. Stocks, ETFs)</option>
                <option value="crypto">Crypto (e.g. Bitcoin, Ethereum)</option>
                <option value="fixed_income">Fixed Income (e.g. US Treasuries, Corporate Bonds)</option>
                <option value="real_estate">Real Estate (e.g. Residential, Commercial)</option>
                <option value="cash">Cash & Equivalents (e.g. Savings, Money Market)</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="demo-file">Brokerage Statement (File Upload for CSV Import)</Label>
              <FileInput id="demo-file" accept=".csv" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="demo-textarea">Transaction Notes (Multi-line Textarea)</Label>
              <Textarea id="demo-textarea" placeholder="e.g. Reinvested quarterly dividend or note for tax year 2024..." />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <Checkbox
                label="Enable automatic valuation sync"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              <Checkbox label="Disabled option" disabled />
            </div>
          </div>
        </div>

        {/* Typography & Text */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">Text & Heading</Heading>
          <div className="space-y-2">
            <Heading level="h1">Heading 1 (30px)</Heading>
            <Heading level="h2">Heading 2 (24px)</Heading>
            <Heading level="h3">Heading 3 (20px)</Heading>
            <Heading level="h4">Heading 4 (18px)</Heading>
            <Text variant="body">Body text — standard readable paragraph text.</Text>
            <Text variant="caption" tone="muted">Caption text — secondary metadata and timestamps.</Text>
            <Text variant="overline" tone="primary">Overline Label</Text>
          </div>
        </div>

        {/* Badges, Avatars, Spinners, Skeletons */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">Badge, Avatar, Spinner, Skeleton, Icon</Heading>
          <div className="flex flex-wrap items-center gap-4">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="success" dot>Success</Badge>
            <Badge tone="warning" dot>Warning</Badge>
            <Badge tone="danger" dot>Danger</Badge>
            <Badge tone="info">Info</Badge>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Avatar name="Masud Alam" size="sm" />
            <Avatar name="Warren Buffett" size="md" />
            <Avatar name="Satoshi Nakamoto" size="lg" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-4 pt-2 text-text-muted">
            <Icon name="Wallet" size="md" />
            <Icon name="PieChart" size="md" />
            <Icon name="TrendingUp" size="md" />
            <Icon name="ShieldCheck" size="md" />
            <Icon name="Building2" size="md" />
          </div>
        </div>

        {/* Formatted Text Atoms */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">MoneyText, PercentText, DateText</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Text variant="caption" tone="muted">MoneyText</Text>
              <div className="text-xl font-bold mt-1">
                <MoneyText value={1425890.5} />
              </div>
            </div>
            <div>
              <Text variant="caption" tone="muted">PercentText (Gain / Loss)</Text>
              <div className="text-xl font-bold mt-1 space-x-2">
                <PercentText value={14.85} colored />
                <PercentText value={-3.4} colored />
              </div>
            </div>
            <div>
              <Text variant="caption" tone="muted">DateText</Text>
              <div className="mt-1">
                <DateText value={new Date('2024-05-15T14:30:00Z')} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ================= MOLECULES ================= */}
      <section className="space-y-8">
        <Heading level="h2">Molecules</Heading>

        {/* CardHeader & InputGroup & FormField */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <CardHeader
            title="Form Controls & Inputs"
            subtitle="Demonstrating FormField, SearchBox, CurrencyInput, and InputGroup"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Asset Symbol" hint="e.g. AAPL, BTC, MSFT" required>
              <Input placeholder="Enter symbol" />
            </FormField>

            <FormField label="Tax Basis" error="Must be a valid positive amount">
              <CurrencyInput defaultValue="5000.00" />
            </FormField>

            <div className="md:col-span-2">
              <Label>InputGroup with custom prefix and suffix</Label>
              <InputGroup prefix="#" suffix="LOT">
                <Input placeholder="1001" />
              </InputGroup>
            </div>

            <div className="md:col-span-2">
              <Label>SearchBox with Clear</Label>
              <SearchBox
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue('')}
                placeholder="Search transactions..."
              />
            </div>
          </div>
        </div>

        {/* StatCard & GainLossIndicator */}
        <div className="space-y-4">
          <Heading level="h3">StatCard & GainLossIndicator</Heading>
          <div className="flex gap-4 p-4 rounded-lg border border-border bg-surface items-center flex-wrap">
            <Text variant="label">Stand-alone GainLossIndicator:</Text>
            <GainLossIndicator value={15.4} currencyValue={1540} />
            <GainLossIndicator value={-4.2} currencyValue={-420} />
            <GainLossIndicator value={0} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Net Worth"
              value={1245000}
              change={8.4}
              currencyValue={96500}
              helperText="vs. last month"
            />
            <StatCard
              label="Total Unrealized Gain"
              value={320450}
              change={24.5}
              helperText="All-time return"
            />
            <StatCard
              label="Realized Gain (YTD)"
              value={-12400}
              change={-2.1}
              helperText="2024 Tax year"
            />
          </div>
        </div>

        {/* NavItem Showcase */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">NavItem</Heading>
          <div className="flex gap-2 max-w-md">
            <NavItem href="/dashboard" label="Dashboard (Active)" icon="LayoutDashboard" active />
            <NavItem href="/accounts" label="Accounts" icon="Wallet" />
          </div>
        </div>

        {/* FreshnessBadge & AssetClassTag */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">FreshnessBadge & AssetClassTag</Heading>
          <div className="flex flex-wrap gap-3">
            <FreshnessBadge source="finnhub" method="market" freshness="live" asOf="2024-05-15T16:00:00Z" />
            <FreshnessBadge source="coingecko" method="market" freshness="delayed" asOf="2024-05-15T15:45:00Z" />
            <FreshnessBadge source="manual" method="manual" freshness="manual" asOf="2024-05-15T09:30:00Z" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <AssetClassTag assetClass="equity" />
            <AssetClassTag assetClass="crypto" />
            <AssetClassTag assetClass="fixed-income" />
            <AssetClassTag assetClass="real-estate" />
            <AssetClassTag assetClass="cash" />
          </div>
        </div>

        {/* Alert & DisclaimerNotice */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">Alert & DisclaimerNotice</Heading>
          <div className="space-y-3">
            <Alert tone="warning" title="Delayed Market Data">
              Finnhub quote prices for US equities are delayed by 15 minutes on the free tier.
            </Alert>
            <Alert tone="success" title="Backup Complete">
              Portfolio snapshot successfully generated.
            </Alert>
            <DisclaimerNotice variant="banner" />
          </div>
        </div>

        {/* Stepper, Pagination, UserInfo */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">Stepper, Pagination, UserInfo, ConfirmDialog</Heading>
          <Stepper
            steps={[
              { id: '1', label: 'Select Account' },
              { id: '2', label: 'Upload CSV' },
              { id: '3', label: 'Map Columns' },
              { id: '4', label: 'Confirm' },
            ]}
            currentStep={activeStep}
          />
          <div className="flex justify-between items-center pt-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            >
              Previous Step
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
            >
              Next Step
            </Button>
          </div>

          <Divider />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-surface">
            <div className="w-64">
              <UserInfo
                name="Demo User"
                email="demo@wealthtrack.dev"
                dropdownPosition="bottom"
              />
            </div>
            <div className="flex items-center gap-2">
              <LogoutButton variant="secondary" />
              <Button variant="danger" size="sm" onClick={() => setDialogOpen(true)}>
                Open Confirm Dialog
              </Button>
            </div>
          </div>

          <Pagination
            page={currentPage}
            totalPages={8}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>

        {/* ChartContainer */}
        <div>
          <ChartContainer title="Asset Allocation Breakdown" subtitle="Current portfolio distribution by asset class">
            <div className="h-48 w-full flex items-center justify-center bg-surface-muted rounded text-text-muted text-sm border border-dashed border-border">
              Recharts components integrate here in Phase 1+
            </div>
          </ChartContainer>
        </div>

        {/* EmptyState */}
        <div className="p-6 rounded-lg border border-border bg-surface">
          <Heading level="h3" className="mb-4">EmptyState</Heading>
          <EmptyState
            title="No fixed income bonds found"
            description="Add corporate or municipal bonds, Treasury notes, or CDs to track coupon schedules and yields."
            action={<Button>Add Bond</Button>}
          />
        </div>
      </section>

      <Divider />

      {/* ================= ORGANISMS ================= */}
      <section className="space-y-8">
        <div>
          <Heading level="h2">Organisms (Phase 1)</Heading>
          <Text variant="caption" tone="muted">
            Complex multi-molecule components for Account, Ledger, and Holdings domains
          </Text>
        </div>

        {/* Generic DataTable Organism */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">DataTable (Generic shared table foundation)</Heading>
          <DataTable
            columns={[
              { header: 'Metric', accessorKey: 'metric' },
              { header: 'Status', accessorKey: 'status' },
              { header: 'Score', accessorKey: 'score', align: 'right' },
            ]}
            data={[
              { id: '1', metric: 'Portfolio Diversification', status: 'Optimal', score: '94/100' },
              { id: '2', metric: 'Liquidity Reserve', status: 'Healthy', score: '88/100' },
            ]}
            keyExtractor={(item) => item.id}
          />
        </div>

        {/* AccountList Organism */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">AccountList</Heading>
          <AccountList
            accounts={[
              {
                id: 'demo-acc-1',
                name: 'Fidelity Brokerage',
                type: 'brokerage',
                currency: 'USD',
                cashBalance: '14250.00',
                description: 'Taxable trading account with margin',
              },
              {
                id: 'demo-acc-2',
                name: 'Vanguard Roth IRA',
                type: 'roth_ira',
                currency: 'USD',
                cashBalance: '5300.25',
              },
            ]}
          />
        </div>

        {/* HoldingsTable Organism */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">HoldingsTable (Built on shared DataTable)</Heading>
          <HoldingsTable
            holdings={[
              {
                accountId: 'demo-acc-1',
                accountName: 'Fidelity Brokerage',
                instrumentId: 'demo-inst-1',
                symbol: 'AAPL',
                instrumentName: 'Apple Inc.',
                assetClass: 'equity',
                quantity: '20',
                averageCost: '110.00',
                totalCost: '2200.00',
              },
              {
                accountId: 'demo-acc-1',
                accountName: 'Fidelity Brokerage',
                instrumentId: 'demo-inst-2',
                symbol: 'BTC',
                instrumentName: 'Bitcoin',
                assetClass: 'crypto',
                quantity: '0.25',
                averageCost: '22400.00',
                totalCost: '5600.00',
              },
            ]}
          />
        </div>

        {/* TransactionTable Organism */}
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <Heading level="h3">TransactionTable (Built on shared DataTable)</Heading>
          <TransactionTable
            transactions={[
              {
                id: 'tx-1',
                accountId: 'demo-acc-1',
                accountName: 'Fidelity Brokerage',
                instrumentId: 'demo-inst-1',
                symbol: 'AAPL',
                instrumentName: 'Apple Inc.',
                type: 'buy',
                date: '2024-01-15T00:00:00.000Z',
                quantity: '10',
                price: '100.00',
                amount: '1000.00',
                fee: '0',
                isVoided: false,
              },
              {
                id: 'tx-2',
                accountId: 'demo-acc-1',
                accountName: 'Fidelity Brokerage',
                instrumentId: 'demo-inst-1',
                symbol: 'AAPL',
                instrumentName: 'Apple Inc.',
                type: 'buy',
                date: '2024-01-16T00:00:00.000Z',
                quantity: '10',
                price: '120.00',
                amount: '1200.00',
                fee: '0',
                isVoided: false,
              },
              {
                id: 'tx-3',
                accountId: 'demo-acc-1',
                accountName: 'Fidelity Brokerage',
                instrumentId: 'demo-inst-1',
                symbol: 'AAPL',
                instrumentName: 'Apple Inc.',
                type: 'buy',
                date: '2024-01-17T00:00:00.000Z',
                quantity: '5',
                price: '150.00',
                amount: '750.00',
                fee: '0',
                isVoided: true,
                voidedReason: 'Duplicate transaction recorded by error',
              },
            ]}
          />
        </div>
      </section>

      {/* Phase 3: Fixed Income Organisms */}
      <section className="space-y-4">
        <Heading level="h2">Fixed Income Organisms (Phase 3)</Heading>
        <div className="space-y-6">
          <BondDetailsPanel
            bond={{
              symbol: 'UST-10Y',
              name: 'US Treasury 4.5% 2034',
              faceValue: '1000',
              couponRate: '0.045',
              couponFrequency: 'semi_annual',
              maturityDate: '2034-01-01T00:00:00.000Z',
              issueDate: '2024-01-01T00:00:00.000Z',
              dayCount: 'actual_actual',
              subType: 'treasury_note',
            }}
            currentPrice="980.00"
          />

          <CouponScheduleTable
            bond={{
              symbol: 'UST-2Y',
              name: 'US Treasury 4.0% 2026',
              faceValue: '1000',
              couponRate: '0.04',
              couponFrequency: 'semi_annual',
              maturityDate: '2026-01-01T00:00:00.000Z',
              issueDate: '2024-01-01T00:00:00.000Z',
            }}
          />

          <MaturityLadder
            bonds={[
              {
                symbol: 'UST-6M',
                name: 'US Treasury Bill 6M',
                maturityDate: '2024-06-01T00:00:00.000Z',
                faceValue: '1000',
                marketPrice: '980',
                quantity: '5',
                couponRate: '0.00',
              },
              {
                symbol: 'UST-2Y',
                name: 'US Treasury Note 2Y',
                maturityDate: '2025-06-01T00:00:00.000Z',
                faceValue: '1000',
                marketPrice: '990',
                quantity: '10',
                couponRate: '0.045',
              },
              {
                symbol: 'UST-10Y',
                name: 'US Treasury Bond 10Y',
                maturityDate: '2034-01-01T00:00:00.000Z',
                faceValue: '1000',
                marketPrice: '1000',
                quantity: '2',
                couponRate: '0.04',
              },
            ]}
            asOfDate="2024-01-01T00:00:00.000Z"
          />
        </div>
      </section>

      {/* ─── Phase 4: Dashboard & Real Estate Organisms ──────────────── */}
      <section className="space-y-4">
        <Heading level="h2">Phase 4: Dashboard &amp; Performance Organisms</Heading>
        <div className="space-y-6">
          <DashboardSection
            title="Performance Summary"
            subtitle="Time-weighted and money-weighted return calculations"
          >
            <PerformancePanel
              twrPct={14.8}
              mwrPct={16.2}
              liquidReturnPct={18.5}
              appraisedReturnPct={5.2}
            />
          </DashboardSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardSection title="Asset Allocation Chart" subtitle="Donut chart with groupBy toggle">
              <AllocationChart
                assetClassData={[
                  { id: '1', label: 'Equities & ETFs', value: 450000, color: 'var(--asset-equity)' },
                  { id: '2', label: 'Digital Assets', value: 120000, color: 'var(--asset-crypto)' },
                  { id: '3', label: 'Fixed Income', value: 200000, color: 'var(--asset-fixed-income)' },
                  { id: '4', label: 'Real Estate', value: 650000, color: 'var(--asset-real-estate)' },
                  { id: '5', label: 'Cash & Reserves', value: 80000, color: 'var(--asset-cash)' },
                ]}
                accountTypeData={[
                  { id: 'a1', label: 'Brokerage', value: 570000 },
                  { id: 'a2', label: 'Retirement (IRA)', value: 200000 },
                  { id: 'a3', label: 'Real Estate Entity', value: 650000 },
                  { id: 'a4', label: 'Bank Checking/Savings', value: 80000 },
                ]}
              />
            </DashboardSection>

            <DashboardSection title="Income by Month Chart" subtitle="Yield cash flows">
              <IncomeChart
                data={[
                  { month: 'May 24', dividends: 140, coupons: 300, interest: 45, rent: 1800, total: 2285 },
                  { month: 'Jun 24', dividends: 260, coupons: 300, interest: 50, rent: 1800, total: 2410 },
                  { month: 'Jul 24', dividends: 180, coupons: 300, interest: 45, rent: 1800, total: 2325 },
                  { month: 'Aug 24', dividends: 310, coupons: 300, interest: 48, rent: 1800, total: 2458 },
                  { month: 'Sep 24', dividends: 220, coupons: 300, interest: 52, rent: 1800, total: 2372 },
                  { month: 'Oct 24', dividends: 290, coupons: 300, interest: 55, rent: 1800, total: 2445 },
                ]}
              />
            </DashboardSection>
          </div>

          <DashboardSection title="Top Holdings Table" subtitle="Largest portfolio positions">
            <TopHoldings
              holdings={[
                {
                  symbol: 'AAPL',
                  name: 'Apple Inc.',
                  assetClass: 'equity',
                  quantity: '500',
                  marketValue: '90000',
                  totalCost: '75000',
                  unrealisedPnL: '15000',
                  unrealisedPnLPct: '20.0',
                  allocationPct: '6.0',
                },
                {
                  symbol: 'BTC',
                  name: 'Bitcoin',
                  assetClass: 'crypto',
                  quantity: '1.5',
                  marketValue: '102000',
                  totalCost: '60000',
                  unrealisedPnL: '42000',
                  unrealisedPnLPct: '70.0',
                  allocationPct: '6.8',
                },
                {
                  symbol: 'UST-10Y',
                  name: 'US Treasury 10Y Bond',
                  assetClass: 'fixed_income',
                  quantity: '100',
                  marketValue: '98500',
                  totalCost: '100000',
                  unrealisedPnL: '-1500',
                  unrealisedPnLPct: '-1.5',
                  allocationPct: '6.5',
                },
              ]}
            />
          </DashboardSection>
        </div>
      </section>

      <section className="space-y-4">
        <Heading level="h2">Phase 4: Real Estate Components</Heading>
        <div className="space-y-6">
          <Tabs
            items={[
              { id: 'tab1', label: 'Overview' },
              { id: 'tab2', label: 'Financing', badge: 1 },
              { id: 'tab3', label: 'Schedule' },
            ]}
            activeTab="tab1"
            onChange={() => {}}
          />

          <PropertyForm
            accounts={[{ id: 'acc-1', name: 'Primary Account' }]}
            onSubmit={() => {}}
          />

          <MortgagePanel
            propertyId="prop-demo"
            propertyValue="650000"
            ownershipPct={1.0}
            mortgage={{
              id: 'm1',
              name: 'Austin Property Mortgage',
              principal: '480000',
              rate: '0.0625',
              termMonths: 360,
              startDate: '2023-01-01',
              outstandingBalance: '472000',
            }}
          />

          <ValuationHistory
            propertyId="prop-demo"
            propertyName="Austin Property"
            records={[
              {
                id: 'vm1',
                date: '2024-06-01',
                value: '650000',
                method: 'manual',
                note: 'Appraisal for loan refi',
              },
              {
                id: 'vm2',
                date: '2023-01-01',
                value: '600000',
                method: 'manual',
                note: 'Acquisition price',
              },
            ]}
            onAddMark={() => {}}
          />

          <AmortizationTable
            principal="480000"
            annualInterestRatePct="6.25"
            termMonths={360}
            startDate="2023-01-01"
          />
        </div>
      </section>

      {/* PHASE 5: TAX LOTS, CAPITAL GAINS & RISK */}
      <section className="space-y-4">
        <Heading level="h2">Phase 5: Capital Gains, Tax Lots & Risk</Heading>
        <div className="space-y-6">
          <TaxLotTable
            lots={[
              {
                id: 'lot-demo-1',
                transactionId: 'tx-1',
                accountId: 'acc-1',
                accountName: 'Brokerage Account',
                instrumentId: 'inst-1',
                symbol: 'AAPL',
                name: 'Apple Inc.',
                openDate: new Date('2024-01-15'),
                originalQuantity: '10.00000000',
                remainingQuantity: '10.00000000',
                costBasisPerUnit: '150.00',
                totalCostBasis: '1500.00',
                currentPrice: '185.00',
                currentValue: '1850.00',
                unrealizedGainLoss: '350.00',
                unrealizedGainLossPct: '23.33',
                term: 'long_term',
                holdingDays: 410,
              },
            ]}
          />

          <RealizedGainsReport
            summary={{
              taxYear: 2025,
              shortTermProceeds: '2500.00',
              shortTermCostBasis: '2000.00',
              shortTermGain: '500.00',
              longTermProceeds: '5000.00',
              longTermCostBasis: '3200.00',
              longTermGain: '1800.00',
              totalProceeds: '7500.00',
              totalCostBasis: '5200.00',
              totalGain: '2300.00',
              lots: [
                {
                  id: 'realized-demo-1',
                  buyTransactionId: 'tx-1',
                  sellTransactionId: 'tx-2',
                  accountId: 'acc-1',
                  instrumentId: 'inst-1',
                  symbol: 'NVDA',
                  name: 'NVIDIA Corp',
                  openDate: new Date('2024-01-10'),
                  closeDate: new Date('2025-03-01'),
                  quantity: '5.00000000',
                  costBasis: '1500.00',
                  proceeds: '3000.00',
                  gainLoss: '1500.00',
                  term: 'long_term',
                  holdingDays: 415,
                },
              ],
            }}
          />

          <RiskPanel
            riskData={{
              totalPortfolioValue: '125000.00',
              topHoldingPct: '28.00',
              topHoldingSymbol: 'AAPL',
              top5Pct: '72.00',
              diversificationScore: 74,
              diversificationRating: 'Moderate',
              estimatedAnnualVolatility: '14.80%',
              assetClassCount: 4,
              positionCount: 12,
              topHoldings: [
                {
                  instrumentId: 'inst-1',
                  symbol: 'AAPL',
                  name: 'Apple Inc.',
                  assetClass: 'equity',
                  value: '35000.00',
                  percentage: '28.00',
                },
                {
                  instrumentId: 'inst-2',
                  symbol: 'MSFT',
                  name: 'Microsoft Corp',
                  assetClass: 'equity',
                  value: '22000.00',
                  percentage: '17.60',
                },
              ],
              assetClassBreakdown: [
                { assetClass: 'equity', value: '75000.00', percentage: '60.00' },
                { assetClass: 'fixed_income', value: '30000.00', percentage: '24.00' },
                { assetClass: 'crypto', value: '12000.00', percentage: '9.60' },
                { assetClass: 'cash', value: '8000.00', percentage: '6.40' },
              ],
              deterministicInsights: [
                {
                  id: 'demo-insight-1',
                  type: 'success',
                  title: 'Multi-Asset Spread',
                  description: 'Assets distributed across 4 distinct asset classes.',
                },
              ],
            }}
          />
        </div>
      </section>

      <ConfirmDialog
        open={dialogOpen}
        title="Delete Transaction?"
        description="Are you sure you want to void this transaction? The transaction record will be preserved in the immutable ledger for audit purposes."
        confirmLabel="Void Transaction"
        onConfirm={() => setDialogOpen(false)}
        onCancel={() => setDialogOpen(false)}
      />
    </div>
  );
}
