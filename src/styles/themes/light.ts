import { palette } from '../tokens/colors';
import type { SemanticColors } from '../tokens/colors';

/**
 * Light theme — Obsidian & Emerald (Private Wealth aesthetic).
 * Cool Alabaster surfaces paired with Deep Emerald primary accents.
 */
export const lightTheme: SemanticColors & Record<string, string> = {
  // Layout
  background: palette.gray[50],
  surface: palette.white,
  'surface-muted': palette.gray[100],
  'surface-hover': '#e8edf3',
  'surface-active': '#dce3ec',

  // Borders
  border: palette.gray[200],
  'border-strong': palette.gray[400],

  // Text
  text: '#0b1220',
  'text-muted': palette.gray[500],
  'text-disabled': palette.gray[400],
  'text-inverse': palette.white,

  // Primary (Deep Emerald — >= 5.4:1 white text contrast)
  primary: palette.emerald[700],
  'primary-hover': palette.emerald[800],
  'primary-active': palette.teal[900],
  'primary-foreground': palette.white,
  'primary-muted': palette.teal[50],

  // Danger (Crimson Red)
  danger: palette.red[600],
  'danger-hover': palette.red[700],
  'danger-foreground': palette.white,
  'danger-muted': palette.red[50],

  // Success (Emerald Green)
  success: palette.emerald[600],
  'success-foreground': palette.white,
  'success-muted': palette.emerald[50],

  // Warning (Warm Amber)
  warning: palette.amber[600],
  'warning-foreground': palette.white,
  'warning-muted': palette.amber[50],

  // Info (Ocean Teal)
  info: palette.teal[600],
  'info-foreground': palette.white,
  'info-muted': palette.teal[50],

  // Finance: gain (Emerald)
  gain: palette.emerald[600],
  'gain-foreground': palette.white,
  'gain-muted': palette.emerald[50],

  // Finance: loss (Crimson)
  loss: palette.red[600],
  'loss-foreground': palette.white,
  'loss-muted': palette.red[50],

  // Finance: neutral change
  'neutral-change': palette.gray[500],

  // Focus ring
  'focus-ring': palette.teal[500],

  // Overlay / scrim
  overlay: 'rgb(9 13 22 / 0.55)',

  // Asset class colors (for badges and chart segments)
  'asset-equity': palette.blue[500],
  'asset-crypto': palette.purple[500],
  'asset-fixed-income': palette.teal[600],
  'asset-real-estate': palette.amber[600],
  'asset-cash': palette.emerald[500],
};
