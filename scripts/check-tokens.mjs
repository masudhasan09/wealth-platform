#!/usr/bin/env node
/**
 * Token guard: fails if any file in src/components or src/app contains:
 *  1. Raw hex colors (#xxxxxx or #xxx)
 *  2. Arbitrary Tailwind values like [13px] or [#333]
 *
 * Run with: node scripts/check-tokens.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src/components', 'src/app'];
// Hex color pattern (not inside strings that are clearly comments or token files)
const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;
// Arbitrary Tailwind values like [13px], [1.5rem], [#333], [rgba(...)]
const ARBITRARY_VALUE = /\[(?:[0-9]+(?:\.[0-9]+)?(?:px|rem|em|vh|vw|%)|#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\]/g;

const IGNORED_EXTENSIONS = ['.md', '.json', '.svg', '.png', '.ico'];

function walkDir(dir) {
  let files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory() && entry !== 'node_modules' && entry !== '.next') {
        files = files.concat(walkDir(full));
      } else if (stat.isFile() && !IGNORED_EXTENSIONS.some(ext => entry.endsWith(ext))) {
        files.push(full);
      }
    }
  } catch {
    // skip unreadable dirs
  }
  return files;
}

let violations = [];

for (const dir of SCAN_DIRS) {
  const absDir = join(ROOT, dir);
  const files = walkDir(absDir);
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      // Skip comment lines
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('#')) return;
      // Skip import lines
      if (line.trim().startsWith('import')) return;

      const hexMatches = [...line.matchAll(HEX_COLOR)];
      const arbitraryMatches = [...line.matchAll(ARBITRARY_VALUE)];

      for (const m of hexMatches) {
        violations.push(`${rel}:${i + 1} — raw hex color "${m[0]}": use a design token instead`);
      }
      for (const m of arbitraryMatches) {
        violations.push(`${rel}:${i + 1} — arbitrary Tailwind value "${m[0]}": use a token-backed class instead`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error('\n❌ Token violations found:\n');
  violations.forEach(v => console.error(' ', v));
  console.error(`\n${violations.length} violation(s). Fix before committing.\n`);
  process.exit(1);
} else {
  console.log('✅ Token check passed — no raw colors or arbitrary values found.');
}
