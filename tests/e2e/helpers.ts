import { expect, type Page } from "@playwright/test";

export const seedPassword = "password123";

export function localDateTime(daysFromNow = 2) {
  const date = new Date(Date.now() + daysFromNow * 86_400_000);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export async function login(page: Page, email: string) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(seedPassword);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/(dashboard|admin)$/);
}
