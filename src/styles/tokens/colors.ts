/**
 * Color tokens — two layers:
 * 1. Primitive palette (Obsidian & Emerald FinTech palette)
 * 2. Semantic roles (used in components via CSS variables)
 *
 * Semantic roles become CSS variables via themeToCss.ts.
 * Components ONLY use semantic role names — never primitive values directly.
 */

// ---------------------------------------------------------------------------
// Primitive palette — Option 1: Obsidian & Emerald
// ---------------------------------------------------------------------------
export const palette = {
  // Neutrals — Cool Alabaster to Obsidian Night
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f6f7f9',
    100: '#eef1f5',
    200: '#e2e6ec',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#526075',
    600: '#334155',
    700: '#243045',
    800: '#1b2436',
    900: '#111827',
    950: '#090d16',
  },
  // Deep Emerald / Teal — primary wealth brand
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#5eead4',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#0f766e',
    800: '#115e59',
    900: '#064e3b',
    950: '#042f2e',
  },
  // Royal Blues — equities & info accents
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554',
  },
  // Greens — gain / success
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#064e3b',
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
    800: '#7f1d1d',
  },
  // Yellows — warning
  yellow: {
    50: '#fffbeb',
    100: '#fef3c3',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#78350f',
  },
  // Oranges — alerts
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
  },
  // Violets — crypto asset class
  purple: {
    50: '#f5f3ff',
    100: '#ede9fe',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
  },
  // Teals — primary dark / fixed income
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#0d3b38',
    950: '#042f2e',
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
  | 'border'
  | 'border-strong'
  // Text
  | 'text'
  | 'text-muted'
  | 'text-disabled'
  | 'text-inverse'
  // Brand primary
  | 'primary'
  | 'primary-hover'
  | 'primary-active'
  | 'primary-foreground'
  | 'primary-muted'
  // Semantic status
  | 'danger'
  | 'danger-hover'
  | 'danger-foreground'
  | 'danger-muted'
  | 'success'
  | 'success-foreground'
  | 'success-muted'
  | 'warning'
  | 'warning-foreground'
  | 'warning-muted'
  | 'info'
  | 'info-foreground'
  | 'info-muted'
  // Finance-specific
  | 'gain'
  | 'gain-foreground'
  | 'gain-muted'
  | 'loss'
  | 'loss-foreground'
  | 'loss-muted'
  | 'neutral-change'
  // Interactive states
  | 'focus-ring'
  | 'overlay';

export type SemanticColors = Record<SemanticColorRole, string>;
