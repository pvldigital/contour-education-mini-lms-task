import { expect, test } from "@playwright/test";

import { localDateTime, login } from "./helpers";

test("student can book and manage their own consultation", async ({
  page,
}) => {
  const reason = `E2E consultation ${Date.now()}`;

  await login(page, "student@example.com");
  await page
    .locator("#main-content")
    .getByRole("link", { name: "Book consultation" })
    .click();
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Student");
  await page.getByLabel("Reason for consultation").fill(reason);
  await page.getByLabel("Date and time").fill(localDateTime(3));
  await page.getByRole("button", { name: "Book consultation" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  const row = page.getByRole("row").filter({ hasText: reason });
  await expect(row).toBeVisible();

  await row
    .getByRole("button", { name: /Actions for consultation/ })
    .click();
  await page.getByRole("menuitem", { name: "Mark as complete" }).click();
  await expect(row.getByText("Completed")).toBeVisible();

  await row
    .getByRole("button", { name: /Actions for consultation/ })
    .click();
  await page.getByRole("menuitem", { name: "Mark as incomplete" }).click();
  await expect(row.getByText("Scheduled")).toBeVisible();

  await row
    .getByRole("button", { name: /Actions for consultation/ })
    .click();
  await page.getByRole("menuitem", { name: "Reschedule" }).click();
  await page.getByLabel("New date and time").fill(localDateTime(4));
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByLabel("New date and time")).toHaveCount(0);

  page.once("dialog", (dialog) => dialog.accept());
  await row
    .getByRole("button", { name: /Actions for consultation/ })
    .click();
  await page.getByRole("menuitem", { name: "Cancel consultation" }).click();
  await expect(row.getByText("Cancelled")).toBeVisible();
  await expect(
    row.getByRole("button", { name: /Actions for consultation/ }),
  ).toHaveCount(0);
});
