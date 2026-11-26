import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

const url = process.env.TEST_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.TEST_SUPABASE_ANON_KEY;

if (!anonKey) {
  throw new Error(
    "TEST_SUPABASE_ANON_KEY is required. Set it from `supabase status -o env`.",
  );
}

const host = new URL(url).hostname;
if (!["127.0.0.1", "localhost"].includes(host)) {
  throw new Error("Integration tests must use a local Supabase instance.");
}

const key: string = anonKey;

export const testSupabase = { url, key };

function createRawClient() {
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export type TestClient = ReturnType<typeof createRawClient>;
export const seedPassword = "password123";

export const seedIds = {
  admin: "11111111-1111-4111-8111-111111111111",
  student: "22222222-2222-4222-8222-222222222222",
  studentTwo: "33333333-3333-4333-8333-333333333333",
  studentConsultation: "aaaaaaaa-1111-4111-8111-aaaaaaaaaaa1",
  studentTwoConsultation: "bbbbbbbb-1111-4111-8111-bbbbbbbbbbb1",
} as const;

export async function createTestClient(
  email?: string,
): Promise<TestClient> {
  const client = createRawClient();

  if (email) {
    const { error } = await client.auth.signInWithPassword({
      email,
      password: seedPassword,
    });

    if (error) {
      throw error;
    }
  }

  return client;
}
