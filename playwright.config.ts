import { defineConfig } from "@playwright/test";

const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3100";
const supabaseUrl = process.env.TEST_SUPABASE_URL;
const supabaseKey = process.env.TEST_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY are required for E2E tests.",
  );
}

const supabaseHost = new URL(supabaseUrl).hostname;
if (!["127.0.0.1", "localhost"].includes(supabaseHost)) {
  throw new Error("E2E tests must run against a local Supabase instance.");
}

const port = new URL(baseURL).port || "3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm build && pnpm exec next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
    },
  },
});
