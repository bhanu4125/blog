import { expect, test } from "@playwright/test";

test("a new user can publish a story", async ({ page }) => {
  const email = `writer-${Date.now()}@example.com`;
  const password = "playwright-password-123";
  const title = `A story from Playwright ${Date.now()}`;
  const content = "This story was created by the end-to-end test.";

  await page.goto("/register");
  await page.getByLabel("Name").fill("Playwright Writer");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByText("Your account is ready. You can sign in now.")
  ).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/write");
  await expect(
    page.getByRole("heading", { name: "Write a story" })
  ).toBeVisible();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Story").fill(content);
  await page
    .getByRole("group", { name: "Post status" })
    .getByRole("button", { name: "published" })
    .click();
  await page.getByRole("button", { name: "Publish post" }).click();

  await expect(page).toHaveURL(/\/posts\/a-story-from-playwright-/, {
    timeout: 30_000,
  });
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(
    page.locator(".markdown-content").getByText(content)
  ).toBeVisible();
});
