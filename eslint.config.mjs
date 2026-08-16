import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  // Override default ignores of eslint-config-next. Replacing the defaults
  // means every build artefact has to be listed here explicitly — anything
  // omitted gets linted, and bundled/minified output produces thousands of
  // spurious errors that bury the real ones.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare build artefacts (see .gitignore): the OpenNext bundle and
    // the packaged Pages output are generated, minified JS — never linted.
    ".open-next/**",
    ".wrangler/**",
    "out-cf/**",
    // Generated static data + coverage output.
    "public/data/**",
    "coverage/**",
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
