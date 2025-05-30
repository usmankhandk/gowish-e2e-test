// tests/fixtures.ts
import { test as base } from '@playwright/test';
import { expect, Page } from '@playwright/test';

//
// ✅ Reusable utility: Navigate to email login page
//
export async function goToEmailLoginPage(page: Page) {
  await page.goto('https://gowish.com/en');
  await expect(page).toHaveTitle(/GoWish/);
  await expect(page.getByRole('heading', { name: 'All your wishes in one place' })).toBeVisible();

  const declineButton = page.getByRole('button', { name: 'Decline all' });
  if (await declineButton.isVisible({ timeout: 5000 })) {
    await declineButton.click();
    await expect(declineButton).toHaveCount(0);
  }

  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByText('Continue with e-mail', { exact: true }).click();
}


// ✅ Custom fixture type

type TestFixtures = {
  loginAsUser: () => Promise<void>;
};

//
// ✅ Extended test object with login fixture
//
export const test = base.extend<TestFixtures>({
  loginAsUser: async ({ page }, use) => {
    await goToEmailLoginPage(page);

    await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
    await page.getByPlaceholder('Password').fill('Denmark123@');
    await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();
    await page.waitForURL('**/overview');
    await expect(page.getByText('Muhammad Usman')).toBeVisible();

    await use(async () => {});
  }
});
