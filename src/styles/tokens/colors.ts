/**
 * Color tokens — two layers:
 * 1. Primitive palette (raw values)
 * 2. Semantic roles (used in components via CSS variables)
 *
 * Semantic roles become CSS variables via themeToCss.ts.
 * Components ONLY use semantic role names — never primitive values directly.
 */

// ---------------------------------------------------------------------------
// Primitive palette
// ---------------------------------------------------------------------------
export const palette = {
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  // Blues — primary brand
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Greens — gain / success
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
  },
  // Reds — loss / danger
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
  },
  // Yellows — warning
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
  },
  // Oranges — warning/alert
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
  },
  // Purples — crypto asset class
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
  },
  // Teals — fixed income
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
  },
  // Ambers — real estate
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
} as const;

// ---------------------------------------------------------------------------
// Semantic color roles
// Each key becomes a CSS variable: --{key} in :root
// Tailwind @theme maps --color-{key} -> var(--{key})
// ---------------------------------------------------------------------------
export type SemanticColorRole =
  // Page / layout
  | 'background'
  | 'surface'
  | 'surface-muted'
  | 'surface-hover'
  | 'surface-active'
  // Borders
  | 'border'
  | 'border-strong'
  // Text
  | 'text'
  | 'text-muted'
  | 'text-disabled'
  | 'text-inverse'
  // Primary brand
  | 'primary'
  | 'primary-hover'
  | 'primary-active'
  | 'primary-foreground'
  | 'primary-muted'
  // Danger / destructive
  | 'danger'
  | 'danger-hover'
  | 'danger-foreground'
  | 'danger-muted'
  // Success
  | 'success'
  | 'success-foreground'
  | 'success-muted'
  // Warning
  | 'warning'
  | 'warning-foreground'
  | 'warning-muted'
  // Info
  | 'info'
  | 'info-foreground'
  | 'info-muted'
  // Finance: gain/loss
  | 'gain'
  | 'gain-foreground'
  | 'gain-muted'
  | 'loss'
  | 'loss-foreground'
  | 'loss-muted'
  | 'neutral-change'
  // Focus
  | 'focus-ring'
  // Overlay / scrim
  | 'overlay';

export type SemanticColors = Record<SemanticColorRole, string>;
