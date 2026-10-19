/**
 * Control size tokens.
 * h-control-sm/md/lg are generated as Tailwind utilities via @theme.
 */
export const controlHeight = {
  sm: '2rem',    // 32px — small inputs/buttons
  md: '2.5rem', // 40px — default inputs/buttons
  lg: '3rem',   // 48px — large inputs/buttons
} as const;

export const iconSize = {
  xs: '0.75rem',  // 12px
  sm: '1rem',     // 16px
  md: '1.25rem',  // 20px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
} as const;

export const containerWidth = {
  sm: '40rem',    // 640px
  md: '48rem',    // 768px
  lg: '64rem',    // 1024px
  xl: '80rem',    // 1280px
  '2xl': '96rem', // 1536px
} as const;

export const sidebarWidth = {
  collapsed: '4rem',  // 64px — icon-only
  expanded: '16rem',  // 256px — icon + label
} as const;
