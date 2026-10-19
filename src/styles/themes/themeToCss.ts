/**
 * Converts a theme object into a CSS string of custom property declarations.
 * Usage: inject the output as a <style> tag in the root layout.
 *
 * Example output:
 *   :root {
 *     --background: #f9fafb;
 *     --primary: #2563eb;
 *     ...
 *   }
 */
export function themeToCss(theme: Record<string, string>, selector = ':root'): string {
  const declarations = Object.entries(theme)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}
