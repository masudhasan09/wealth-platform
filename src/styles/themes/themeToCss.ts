/**
 * Converts a theme object into a CSS string of custom property declarations.
 */
export function themeToCss(theme: Record<string, string>, selector = ':root'): string {
  const declarations = Object.entries(theme)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}

/**
 * Emits adaptive light + dark CSS variables using modern `light-dark()` with
 * `@media (prefers-color-scheme: dark)` fallback AND `<meta name="color-scheme">`
 * override selectors so manual toggles and system defaults both work without FOUC.
 */
export function buildAdaptiveThemeCss(
  light: Record<string, string>,
  dark: Record<string, string>
): string {
  const keys = Object.keys(light);
  const lightVars = keys.map((k) => `  --${k}: ${light[k]};`).join('\n');
  const darkVars = keys.map((k) => `  --${k}: ${dark[k] ?? light[k]};`).join('\n');
  const lightDarkVars = keys
    .map((k) => `  --${k}: light-dark(${light[k]}, ${dark[k] ?? light[k]});`)
    .join('\n');

  return `:root {
  color-scheme: light dark;
${lightVars}
}

@media (prefers-color-scheme: dark) {
  :root {
${darkVars}
  }
}

@supports (color: light-dark(white, black)) {
  :root {
${lightDarkVars}
  }
}

:root:has(> head > meta[name="color-scheme"][content="dark"]) {
  color-scheme: dark;
}

:root:has(> head > meta[name="color-scheme"][content="light"]) {
  color-scheme: light;
}`;
}
