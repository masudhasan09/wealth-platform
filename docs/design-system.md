# Design System Guide

## 1. Design Tokens Catalog

All visual values are declared in `src/styles/tokens/`:
- **`colors.ts`**: Primitive palette (`gray`, `blue`, `green`, `red`, `yellow`, `orange`, `purple`, `teal`, `amber`) and Semantic Roles (`primary`, `surface`, `border`, `text`, `gain`, `loss`, `neutral-change`, `focus-ring`, etc.).
- **`finance.ts`**: Asset class tokens (`equity`, `crypto`, `fixed-income`, `real-estate`, `cash`), freshness states (`live`, `delayed`, `manual`, `stale`), valuation methods, and chart series colors.
- **`sizes.ts`**: Control heights (`h-control-sm`: 32px, `h-control-md`: 40px, `h-control-lg`: 48px), icon sizes, container widths, sidebar widths.
- **`typography.ts`**, **`spacing.ts`**, **`radius.ts`**, **`shadows.ts`**, **`breakpoints.ts`**, **`zIndex.ts`**, **`motion.ts`**.

---

## 2. Component Classification Checklist

Before authoring a new component, classify it according to this checklist:

| Level | Definition | Rules | Examples |
|---|---|---|---|
| **Atom** | Smallest UI unit, single element or visual idea | No domain logic, no data loading, minimal state, styled solely via tokens | `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Label`, `Icon`, `Text`, `Heading`, `Badge`, `Avatar`, `Spinner`, `Skeleton`, `Divider`, `MoneyText`, `PercentText`, `DateText` |
| **Molecule** | Small group of atoms working together for one task | Receives all data via props, lightly domain-aware | `FormField`, `SearchBox`, `InputGroup`, `CurrencyInput`, `CardHeader`, `StatCard`, `Alert`, `EmptyState`, `Pagination`, `NavItem`, `UserInfo`, `FreshnessBadge`, `AssetClassTag`, `GainLossIndicator`, `DisclaimerNotice`, `ChartContainer`, `ConfirmDialog`, `Stepper` |
| **Organism** | Self-contained domain section with layout and interaction | Composed of molecules/atoms, receives data via props, no direct DB fetching | `Navbar`, `Sidebar`, `Header`, `Footer`, `HoldingsTable`, `NetWorthSummary`, `TransactionForm` |
| **Template** | Page structure layout with slots | Purely structural; header/sidebar/content/footer slots | `AuthLayout`, `DashboardLayout`, `PageLayout`, `ReportLayout` |
| **Page** | Next.js App Router route file (`page.tsx`) | Server component; loads data, invokes finance functions, maps to view models, composes templates and organisms | `src/app/(app)/dashboard/page.tsx` |

---

## 3. Change Propagation Table

Centralized design tokens allow global updates with a single edit:

| To Change... | Edit This Single File | Automatically Updated Everywhere |
|---|---|---|
| Brand primary color | `src/styles/tokens/colors.ts` or `src/styles/themes/light.ts` | All buttons, links, focus rings, active nav items, chart accents |
| Control heights (Button, Input, Select) | `src/styles/tokens/sizes.ts` | Every button, input, select, and search box across every form and dialog |
| Gain / loss green & red | `src/styles/tokens/finance.ts` | `GainLossIndicator`, `PercentText`, tax lot tables, performance cards |
| Freshness indicator look or badges | `src/components/molecules/FreshnessBadge/` + `tokens/finance.ts` | Net worth header, holdings rows, bond panel, real estate marks, report exports |
| Currency or date format | `src/lib/format/` | Every `MoneyText`, `DateText`, data table, summary tile, and export |
| Form field layout / spacing | `src/components/molecules/FormField/` | Every form field in every modal and page |

---

## 4. How to Add a New Component

1. **Verify need**: Check `/docs/component-catalog.md` first. Extend an existing component with props (`variant`, `size`, `tone`) if possible rather than duplicating.
2. **Create folder**: In `src/components/{atoms|molecules|organisms/<domain>}/ComponentName/`.
3. **Colocate three files**:
   - `ComponentName.tsx`
   - `ComponentName.test.tsx`
   - `index.ts`
4. **Style exclusively with tokens**: Use token-backed Tailwind classes or CSS variables. Never use arbitrary `[13px]` or hex colors `#...`.
5. **Add to Barrel & Catalog**:
   - Export in `src/components/{level}/index.ts`.
   - Add a row in `/docs/component-catalog.md`.
   - Add an interactive showcase entry in `src/app/dev/components/page.tsx`.
6. **Verify**: Run `npm run check` to ensure lint, types, tokens, and tests pass.
