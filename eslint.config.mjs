import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // App code must use the project Link wrapper (prefetch disabled — the
    // CF Pages deploy strips the segment files prefetching would request).
    files: ["src/app/**", "src/components/**", "src/lib/**"],
    ignores: ["src/components/Link.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message:
                "Import Link from '@/components/Link' instead — it disables prefetch (the deploy ships no segment prefetch files) and feeds the nav progress bar.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
