import { describe, it, expect } from 'vitest';
import { lightTheme } from '@/styles/themes/light';
import { darkTheme } from '@/styles/themes/dark';
import { themeToCss } from '@/styles/themes/themeToCss';
import type { SemanticColorRole } from '@/styles/tokens/colors';

const REQUIRED_SEMANTIC_ROLES: SemanticColorRole[] = [
  'background',
  'surface',
  'surface-muted',
  'surface-hover',
  'surface-active',
  'border',
  'border-strong',
  'text',
  'text-muted',
  'text-disabled',
  'text-inverse',
  'primary',
  'primary-hover',
  'primary-active',
  'primary-foreground',
  'primary-muted',
  'danger',
  'danger-hover',
  'danger-foreground',
  'danger-muted',
  'success',
  'success-foreground',
  'success-muted',
  'warning',
  'warning-foreground',
  'warning-muted',
  'info',
  'info-foreground',
  'info-muted',
  'gain',
  'gain-foreground',
  'gain-muted',
  'loss',
  'loss-foreground',
  'loss-muted',
  'neutral-change',
  'focus-ring',
  'overlay',
];

describe('Design Token Integrity', () => {
  it('light theme defines all required semantic color roles', () => {
    for (const role of REQUIRED_SEMANTIC_ROLES) {
      expect(lightTheme[role], `Missing role in light theme: ${role}`).toBeDefined();
      expect(typeof lightTheme[role]).toBe('string');
      expect(lightTheme[role].length).toBeGreaterThan(0);
    }
  });

  it('dark theme defines all required semantic color roles', () => {
    for (const role of REQUIRED_SEMANTIC_ROLES) {
      expect(darkTheme[role], `Missing role in dark theme: ${role}`).toBeDefined();
      expect(typeof darkTheme[role]).toBe('string');
      expect(darkTheme[role].length).toBeGreaterThan(0);
    }
  });

  it('themeToCss produces valid CSS custom properties', () => {
    const css = themeToCss(lightTheme);
    expect(css).toContain(':root {');
    expect(css).toContain('--primary:');
    expect(css).toContain('--background:');
    expect(css).toContain('--gain:');
    expect(css).toContain('--loss:');
  });
});
