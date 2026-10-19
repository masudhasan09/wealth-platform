import { palette } from '../tokens/colors';
import type { SemanticColors } from '../tokens/colors';

/**
 * Dark theme stub — structure mirrors light.ts.
 * Fully implement in a later phase if time allows.
 */
export const darkTheme: SemanticColors & Record<string, string> = {
  background: palette.gray[950],
  surface: palette.gray[900],
  'surface-muted': palette.gray[800],
  'surface-hover': palette.gray[800],
  'surface-active': palette.gray[700],

  border: palette.gray[700],
  'border-strong': palette.gray[500],

  text: palette.gray[50],
  'text-muted': palette.gray[400],
  'text-disabled': palette.gray[600],
  'text-inverse': palette.gray[900],

  primary: palette.blue[400],
  'primary-hover': palette.blue[300],
  'primary-active': palette.blue[200],
  'primary-foreground': palette.gray[900],
  'primary-muted': palette.blue[900],

  danger: palette.red[400],
  'danger-hover': palette.red[300],
  'danger-foreground': palette.gray[900],
  'danger-muted': palette.red[800],

  success: palette.green[500],
  'success-foreground': palette.gray[900],
  'success-muted': palette.green[800],

  warning: palette.yellow[400],
  'warning-foreground': palette.gray[900],
  'warning-muted': palette.yellow[700],

  info: palette.blue[400],
  'info-foreground': palette.gray[900],
  'info-muted': palette.blue[900],

  gain: palette.green[400],
  'gain-foreground': palette.gray[900],
  'gain-muted': palette.green[800],

  loss: palette.red[400],
  'loss-foreground': palette.gray[900],
  'loss-muted': palette.red[800],

  'neutral-change': palette.gray[400],
  'focus-ring': palette.blue[400],
  overlay: 'rgb(0 0 0 / 0.7)',

  'asset-equity': palette.blue[400],
  'asset-crypto': palette.purple[400],
  'asset-fixed-income': palette.teal[400],
  'asset-real-estate': palette.amber[400],
  'asset-cash': palette.green[400],
};
