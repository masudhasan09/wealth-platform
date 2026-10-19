import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Layering enforcement rules (Atomic Design)
  {
    files: ["src/components/atoms/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/molecules*",
                "@/components/organisms*",
                "@/components/templates*",
                "@/app*",
                "@/lib/db*",
                "@/lib/providers*",
                "@/lib/finance*",
                "@prisma/client*",
              ],
              message: "Atomic Layering Violation: Atoms must not import molecules, organisms, templates, app, db, providers, or finance.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/molecules/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/organisms*",
                "@/components/templates*",
                "@/app*",
                "@/lib/db*",
                "@/lib/providers*",
                "@/lib/finance*",
                "@prisma/client*",
              ],
              message: "Atomic Layering Violation: Molecules must not import organisms, templates, app, db, providers, or finance.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/organisms/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/templates*",
                "@/app*",
                "@/lib/db*",
                "@/lib/providers*",
                "@prisma/client*",
              ],
              message: "Atomic Layering Violation: Organisms must not import templates, app, db, providers, or prisma.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/templates/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app*",
                "@/lib/db*",
                "@/lib/providers*",
                "@prisma/client*",
              ],
              message: "Atomic Layering Violation: Templates must not import app, db, providers, or prisma.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/dev.db*",
  ]),
]);

export default eslintConfig;
