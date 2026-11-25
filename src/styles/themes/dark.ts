import { palette } from '../tokens/colors';
import type { SemanticColors } from '../tokens/colors';

/**
 * Dark theme — Obsidian & Emerald.
 * Obsidian Night background, Elevated Slate surfaces, and Bright Teal accents.
 */
export const darkTheme: SemanticColors & Record<string, string> = {
  background: palette.gray[950],
  surface: palette.gray[900],
  'surface-muted': palette.gray[800],
  'surface-hover': '#222e44',
  'surface-active': '#2b3954',

  border: palette.gray[700],
  'border-strong': '#475569',

  text: '#f8fafc',
  'text-muted': palette.gray[400],
  'text-disabled': '#475569',
  'text-inverse': '#0b1220',

  // Primary (Bright Teal with high-contrast dark foreground)
  primary: palette.teal[500],
  'primary-hover': palette.teal[400],
  'primary-active': palette.teal[300],
  'primary-foreground': palette.teal[950],
  'primary-muted': palette.teal[900],

  danger: palette.red[400],
  'danger-hover': palette.red[300],
  'danger-foreground': palette.gray[950],
  'danger-muted': palette.red[800],

  success: palette.emerald[400],
  'success-foreground': palette.gray[950],
  'success-muted': palette.emerald[900],

  warning: palette.amber[400],
  'warning-foreground': palette.gray[950],
  'warning-muted': palette.yellow[700],

  info: palette.teal[400],
  'info-foreground': palette.gray[950],
  'info-muted': palette.teal[900],

  gain: palette.emerald[400],
  'gain-foreground': palette.gray[950],
  'gain-muted': palette.emerald[900],

  loss: palette.red[400],
  'loss-foreground': palette.gray[950],
  'loss-muted': palette.red[800],

  'neutral-change': palette.gray[400],
  'focus-ring': palette.teal[400],
  overlay: 'rgb(0 0 0 / 0.75)',

  'asset-equity': palette.blue[400],
  'asset-crypto': palette.purple[400],
  'asset-fixed-income': palette.teal[400],
  'asset-real-estate': palette.amber[400],
  'asset-cash': palette.emerald[400],
};
