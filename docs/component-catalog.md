# Component Catalog

This catalog tracks every shared component across the 5 atomic levels of WealthTrack.

## Atoms (`src/components/atoms/`)

| Component | Level | Purpose | Key Props | Used By |
|---|---|---|---|---|
| `Button` | Atom | Interactive button | `variant`, `size`, `loading`, `disabled` | Forms, Nav, Dialogs, Cards |
| `Input` | Atom | Single-line text input | `size`, `error`, native input props | FormField, SearchBox, CurrencyInput |
| `Select` | Atom | Native select dropdown | `size`, `error`, native select props | FormField, Filters |
| `Textarea` | Atom | Multi-line text field | `error`, native textarea props | FormField, Transaction notes |
| `Checkbox` | Atom | Toggle checkbox | `label`, `error`, native input props | Forms, Settings, Filters |
| `Label` | Atom | Form input label | `required`, `htmlFor` | FormField, standalone controls |
| `Icon` | Atom | Icon wrapper (single source for `lucide-react`) | `name`, `size`, `aria-label` | All atoms, molecules, and organisms |
| `Text` | Atom | Semantic paragraph or span | `variant`, `tone`, `as` | Cards, tables, forms, headers |
| `Heading` | Atom | Decoupled semantic heading | `level` (h1-h6), `size` (visual) | PageLayout, CardHeader, Modals |
| `Badge` | Atom | Status/tag chip | `tone`, `dot` | FreshnessBadge, AssetClassTag |
| `Avatar` | Atom | User profile image or fallback initials | `name`, `src`, `size` | UserInfo, Header |
| `Spinner` | Atom | Accessible loading indicator | `size`, `label` | Button, Loading states |
| `Skeleton` | Atom | Pulse placeholder for loading content | `circle`, `className` | Table/Card skeletons |
| `Divider` | Atom | Visual separator line | `orientation` (h/v) | Cards, PageLayout, Sidebar |
| `FileInput` | Atom | Native styled file attachment input | `size`, `error`, `accept` | FormField, CsvImportWizard |
| `MoneyText` | Atom | Formatted USD currency text | `value`, `options` | StatCard, tables, summaries |
| `PercentText` | Atom | Formatted percentage with color | `value`, `colored`, `options` | GainLossIndicator, tables |
| `DateText` | Atom | Formatted localized date or time | `value`, `options` | FreshnessBadge, tables, reports |

---

## Molecules (`src/components/molecules/`)

| Component | Level | Purpose | Key Props | Used By |
|---|---|---|---|---|
| `FormField` | Molecule | Form control with label, error, and hint with ARIA | `label`, `required`, `hint`, `error` | All form organisms |
| `CardHeader` | Molecule | Section card title, subtitle, and action slot | `title`, `subtitle`, `action` | Dashboard cards, ChartContainer |
| `StatCard` | Molecule | Summary metric tile with value and gain/loss | `label`, `value`, `change`, `helperText` | Dashboard, NetWorthSummary |
| `Alert` | Molecule | Contextual banner notice with dismiss | `tone`, `title`, `onDismiss` | Form errors, system notices |
| `EmptyState` | Molecule | Empty list placeholder with action button | `icon`, `title`, `description`, `action` | Tables, portfolio sections |
| `DisclaimerNotice` | Molecule | Legal and regulatory informational disclaimer | `variant` (banner, inline, compact) | Footer, ReportLayout, AuthLayout |
| `GainLossIndicator` | Molecule | Metric return badge with arrow icon and ARIA label | `value`, `currencyValue`, `isPercent` | StatCard, Holdings rows, Tables |
| `FreshnessBadge` | Molecule | Data timestamp, source, and reliability indicator | `source`, `asOf`, `method`, `freshness` | Header, HoldingsTable, ValuationMark |
| `AssetClassTag` | Molecule | Colored badge identifying asset category | `assetClass` | Holdings rows, Allocation charts |
| `SearchBox` | Molecule | Search input with icon and clear button | `value`, `onChange`, `onClear` | Header, Table toolbars |
| `InputGroup` | Molecule | Input with prefix or suffix slot | `prefix`, `suffix` | CurrencyInput, Lot inputs |
| `CurrencyInput` | Molecule | Form input with dollar prefix and decimal stepping | `currencySymbol`, `currencyCode` | TransactionForm, PropertyForm |
| `Pagination` | Molecule | Page navigation controls | `page`, `totalPages`, `onPageChange` | Data tables, ledger views |
| `NavItem` | Molecule | Nav link with icon, label, and active styling | `href`, `label`, `icon`, `active` | Sidebar, Navbar |
| `UserInfo` | Molecule | User avatar, name, and email block with keyboard-accessible dropdown menu, Settings link, and LogoutButton | `name`, `email`, `avatarSrc`, `logoutAction`, `dropdownPosition`, `showDropdown` | Sidebar, Navbar, User menus |
| `LogoutButton` | Molecule | Form button executing POST-only logout server action with loading state | `action`, `variant`, `size`, `disabled`, `label` | UserInfo, Sidebar, Mobile menu |
| `ChartContainer` | Molecule | Card wrapper for Recharts visualizations | `title`, `subtitle`, `action`, `height` | AllocationChart, NetWorthChart |
| `ConfirmDialog` | Molecule | Native accessible `<dialog>` confirmation modal | `open`, `title`, `description`, `onConfirm`, `onCancel` | VoidTransactionDialog, Deletes |
| `Stepper` | Molecule | Multi-step progress indicator | `steps`, `currentStep` | CsvImportWizard |

---

## Organisms (`src/components/organisms/`)

| Component | Level | Purpose | Key Props | Used By |
|---|---|---|---|---|
| `DataTable` | Organism | Reusable table with typed column definitions, empty states, and token styling | `columns`, `data`, `keyExtractor`, `emptyTitle`, `emptyAction`, `footer` | TransactionTable, HoldingsTable |
| `LoginForm` | Organism | User login form with client validation and error alerts | `onSubmit`, `isLoading`, `serverError` | LoginPage |
| `RegisterForm` | Organism | Registration form with validation and password criteria | `onSubmit`, `isLoading`, `serverError` | RegisterPage |
| `AccountForm` | Organism | Account creation and update form with type dropdown | `onSubmit`, `initialData`, `isLoading`, `serverError`, `onCancel` | AccountsClient |
| `AccountList` | Organism | Grid of user account cards displaying types and cash balances | `accounts`, `onAddAccount`, `onSelectAccount` | AccountsClient, Dashboard |
| `TransactionForm` | Organism | Transaction entry form for buy/sell/deposit/withdrawal/dividend/interest/fee | `accounts`, `onSubmit`, `isLoading`, `serverError`, `onCancel` | TransactionsClient |
| `TransactionTable` | Organism | Ledger table for transactions with colored badges and void actions | `transactions`, `onVoidTransaction`, `emptyAction` | TransactionsClient |
| `VoidTransactionDialog`| Organism | Confirmation modal for soft-voiding ledger transactions | `transaction`, `open`, `onConfirm`, `onCancel`, `isLoading` | TransactionsClient |
| `HoldingsTable` | Organism | Dynamically computed positions table with cost basis and asset classes | `holdings`, `emptyAction` | HoldingsClient |
| `PriceForm` | Organism | Manual price setting form for any instrument | `defaultTicker`, `onSubmit`, `isLoading`, `serverError` | PricesClient |
| `BondForm` | Organism | Bond instrument entry form (face value, coupon rate, frequency, day-count, maturity) | `onSubmit`, `isLoading`, `serverError`, `onCancel` | FixedIncomeClient |
| `BondDetailsPanel` | Organism | Inspector panel with StatCards for accrued interest, current yield, and YTM | `bond`, `currentPrice`, `asOfDate` | FixedIncomeClient |
| `CouponScheduleTable` | Organism | Data table displaying projected coupon payment cash flows and status | `bond`, `onRecordCoupon` | FixedIncomeClient |
| `MaturityLadder` | Organism | Maturity bucket breakdown chart and table across tenors (<1y, 1-3y, 3-5y, 5-10y, 10y+) | `bonds`, `asOfDate` | FixedIncomeClient |
| `DashboardSection` | Organism | Titled card section container with CardHeader for dashboard blocks | `title`, `subtitle`, `action`, `children` | DashboardClient |
| `AllocationChart` | Organism | Interactive asset class and account allocation donut chart | `assetClassData`, `accountTypeData`, `groupBy` | DashboardClient |
| `IncomeChart` | Organism | Historical monthly income cash flow bar chart | `data`, `height` | DashboardClient |
| `TopHoldings` | Organism | Table showing largest positions by portfolio weight | `holdings`, `limit` | DashboardClient |
| `PerformancePanel` | Organism | Return metrics display (TWR, MWR / XIRR) with illiquid asset disclaimer | `twr`, `mwr`, `hasAppraisedAssets` | DashboardClient |
| `PropertyForm` | Organism | Real estate property acquisition entry form | `onSubmit`, `isLoading`, `onCancel` | RealEstateClient |
| `ValuationHistory` | Organism | Chronological appraisal marks list and entry form | `propertyId`, `valuationMarks`, `onAddMark` | RealEstateClient |
| `MortgagePanel` | Organism | Mortgage overview and liability creation form | `liability`, `onCreateMortgage` | RealEstateClient |
| `AmortizationTable` | Organism | Monthly loan amortization schedule table with pagination | `schedule` | RealEstateClient |
| `TaxLotTable` | Organism | Table showing open FIFO tax lots, remaining quantities, cost basis per unit, and holding term badges | `lots`, `emptyAction` | GainsClient |
| `RealizedGainsReport` | Organism | Schedule D tax-year capital gains report with StatCards and closed lots table | `summary`, `availableYears`, `selectedYear`, `onYearChange` | GainsClient |
| `CsvImportWizard` | Organism | 3-step CSV upload, validation, duplicate detection, and ledger commit wizard | `onCommit`, `existingTransactions` | ImportClient |
| `RiskPanel` | Organism | Portfolio risk dashboard with diversification score (0-100), concentration bar chart, and deterministic rule insights | `riskData` | RiskClient |
| `ReportExportPanel` | Organism | Audit-ready financial report generator with CSV downloads and print/PDF ReportLayout preview | `user`, `holdings`, `gainsSummary`, `netWorthTotal` | ReportsClient |
| `Sidebar` | Organism | Desktop navigation drawer with links and user info | `currentPath`, `user` | DashboardLayout |
| `Header` | Organism | Top application bar with search and freshness indicator | `lastUpdated`, `source`, `onSearch` | DashboardLayout |
| `Navbar` | Organism | Top navigation bar with logo and action slots | `actions` | Marketing / alternative layouts |
| `Footer` | Organism | Application footer with copyright and disclaimer | `className` | DashboardLayout, Marketing |

---

## Templates (`src/components/templates/`)

| Component | Level | Purpose | Slots / Key Props | Used By |
|---|---|---|---|---|
| `AuthLayout` | Template | Centered card layout for authentication | `title`, `subtitle`, `children` | Login, Register |
| `DashboardLayout` | Template | Primary app chrome with sidebar, header, and footer | `currentPath`, `user`, `children` | All authenticated app pages |
| `PageLayout` | Template | Interior page header with actions and breadcrumbs | `title`, `description`, `actions`, `children` | All app pages |
| `ReportLayout` | Template | Print-friendly report layout with header and disclaimer | `title`, `generatedDate`, `user`, `children` | Report export pages |
