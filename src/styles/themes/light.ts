import { palette } from '../tokens/colors';
import type { SemanticColors } from '../tokens/colors';

/**
 * Light theme — maps semantic color roles to primitive palette values.
 * Edit THIS file to change brand colors, not individual components.
 */
export const lightTheme: SemanticColors & Record<string, string> = {
  // Layout
  background: palette.gray[50],
  surface: palette.white,
  'surface-muted': palette.gray[100],
  'surface-hover': palette.gray[100],
  'surface-active': palette.gray[200],

  // Borders
  border: palette.gray[200],
  'border-strong': palette.gray[400],

  // Text
  text: palette.gray[900],
  'text-muted': palette.gray[500],
  'text-disabled': palette.gray[400],
  'text-inverse': palette.white,

  // Primary (blue)
  primary: palette.blue[600],
  'primary-hover': palette.blue[700],
  'primary-active': palette.blue[800],
  'primary-foreground': palette.white,
  'primary-muted': palette.blue[50],

  // Danger (red)
  danger: palette.red[600],
  'danger-hover': palette.red[700],
  'danger-foreground': palette.white,
  'danger-muted': palette.red[50],

  // Success (green)
  success: palette.green[600],
  'success-foreground': palette.white,
  'success-muted': palette.green[50],

  // Warning (yellow)
  warning: palette.yellow[600],
  'warning-foreground': palette.white,
  'warning-muted': palette.yellow[50],

  // Info (blue lighter)
  info: palette.blue[500],
  'info-foreground': palette.white,
  'info-muted': palette.blue[50],

  // Finance: gain (green)
  gain: palette.green[600],
  'gain-foreground': palette.white,
  'gain-muted': palette.green[50],

  // Finance: loss (red)
  loss: palette.red[600],
  'loss-foreground': palette.white,
  'loss-muted': palette.red[50],

  // Finance: neutral change
  'neutral-change': palette.gray[500],

  // Focus ring
  'focus-ring': palette.blue[400],

  // Overlay / scrim
  overlay: 'rgb(0 0 0 / 0.5)',

  // Asset class colors (for badges and chart segments)
  'asset-equity': palette.blue[500],
  'asset-crypto': palette.purple[500],
  'asset-fixed-income': palette.teal[500],
  'asset-real-estate': palette.amber[500],
  'asset-cash': palette.green[500],
};
