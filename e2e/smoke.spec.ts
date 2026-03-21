import { test, expect } from "../playwright-fixture";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
