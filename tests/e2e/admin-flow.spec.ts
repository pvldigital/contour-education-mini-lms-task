import { expect, test } from "@playwright/test";

import { login } from "./helpers";

test("admin sees all consultations and no mutation controls", async ({
  page,
}) => {
  await login(page, "admin@example.com");
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  await expect(page.getByText("All consultations across the system")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Actions for consultation/ }),
  ).toHaveCount(0);

  const response = await page.request.get("/api/admin/consultations");
  expect(response.status()).toBe(200);
  const body = (await response.json()) as {
    consultations: unknown[];
    pagination: { page: number; pageSize: number };
  };
  expect(body.consultations.length).toBeGreaterThan(0);
  expect(body.pagination.page).toBe(1);
});

test("student is redirected from admin and rejected by admin APIs", async ({
  page,
}) => {
  await login(page, "student@example.com");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard$/);

  const response = await page.request.get("/api/admin/consultations");
  expect(response.status()).toBe(403);
});
