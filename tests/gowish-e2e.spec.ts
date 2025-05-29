import { test, expect, Page } from '@playwright/test';

// ✅ Utility: Reusable navigation to email login
async function navigateToEmailLogin(page: Page) {
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

// ✅ Utility: Full login flow
async function login(page: Page, email: string, password: string) {
  await navigateToEmailLogin(page);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();
  await page.waitForURL('**/overview');
  await expect(page.getByText('Muhammad Usman')).toBeVisible();
}

test.describe('GoWish.com E2E Scenarios', () => {

  test('E2E: Add Philips Trimmer Multi to My Wishlist and archive it', async ({ page }) => {
    await login(page, 'usman.dk11@yahoo.com', 'Denmark123@');

    // Step 1: Go to Matas brand
    const viewAllBrands = page.locator('text=Brands').locator('xpath=following::button[contains(., "View all")][1]');
    await viewAllBrands.click();
    await page.waitForURL('**/for-you/brands');

    await page.locator('input[placeholder="Search brand"]').fill('matas');
    const matasTile = page.locator('img[src*="540b7295792942a58d5f.png"]').locator('xpath=ancestor::div[contains(@class, "BrandItem__BrandImageContainer")][1]');
    await expect(matasTile).toBeVisible();
    await matasTile.click();

    // Step 2: Add Philips Trimmer Multi to wishlist
    await page.waitForURL('**/brand/matas');
    await page.locator('input[placeholder="Search"]').fill('Philips Trimmer Multi');
    await expect(page.getByRole('heading', { name: /Results/i })).toBeVisible();

    const productCard = page.locator('text=Philips Trimmer Multi').first().locator('xpath=ancestor::div[contains(@class,"WishCard__WishCardContainer")]');
    await expect(productCard).toBeVisible();

    const addToWishlistBtn = productCard.locator('button[data-testid="more-button-popover"]');
    await expect(addToWishlistBtn).toBeVisible();
    await addToWishlistBtn.click();

    const wishlistPlusBtn = page.locator('div.WishlistSelectRow__Checkmark-sc-ff692291-8');
    await expect(wishlistPlusBtn).toBeVisible();
    await wishlistPlusBtn.click();

    const successToast = page.locator('text=Wish created successfully in My wishlist');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    await successToast.waitFor({ state: 'detached', timeout: 10000 });

    // Step 3: Navigate to wishlist and archive it
    await page.getByTestId('navbarWishlists').click();
    await expect(page).toHaveURL('https://gowish.com/overview');

    const myWishlist = page.locator('[data-cy^="wishlistTitle-"]').filter({ hasText: 'My wishlist' });
    await expect(myWishlist).toBeVisible();
    await myWishlist.first().click();

    const moreMenuButton = page.locator('button:has(img[alt="More button menu icon"])').first();
    await expect(moreMenuButton).toBeVisible();
    await moreMenuButton.click();

    const archiveOption = page.getByText('Archive wishlist', { exact: true });
    await expect(archiveOption).toBeVisible();
    await archiveOption.click({ force: true });
    // Step 4: Confirm archive action
    const confirmArchiveBtn = page.getByRole('button', { name: 'Archive' });
    await expect(confirmArchiveBtn).toBeVisible();
    await confirmArchiveBtn.click();

    // Then verify success toast
    const archiveToast = page.locator('text=Wishlist archived successfully');
    await expect(archiveToast).toBeVisible({ timeout: 10000 });
    await archiveToast.waitFor({ state: 'detached', timeout: 10000 });

    // Step 5: Logout
    await page.locator('button[data-cy="navbarUserProfileAvatar"]').click();
    await page.getByRole('button', { name: 'LOG OUT' }).click();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('Invalid email login shows error popup and dismisses', async ({ page }) => {
    await navigateToEmailLogin(page);
    await page.getByPlaceholder('Email').fill('invalid.email@test.com');
    await page.getByPlaceholder('Password').fill('WrongPassword123');
    await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();

    const popup = page.getByText('This email is not being used');
    await expect(popup).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(popup).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('Login with valid email and wrong password shows error', async ({ page }) => {
    await navigateToEmailLogin(page);
    await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
    await page.getByPlaceholder('Password').fill('WrongPassword123');
    await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();

    const toast = page.getByText('Either the email or password used is incorrect');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCount(0, { timeout: 5000 });
  });

  test('Empty credentials then fill step by step', async ({ page }) => {
    await navigateToEmailLogin(page);
    await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();
    await expect(page.getByText('Please enter a valid password')).toBeVisible();

    await page.getByPlaceholder('Password').fill('Denmark123@');
    await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();

    await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
    await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();

    await expect(page.getByText('Muhammad Usman')).toBeVisible();
    await page.locator('button[data-cy="navbarUserProfileAvatar"]').click();
    await page.getByRole('button', { name: 'LOG OUT' }).click();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('Forgot password flow with confirmation modal', async ({ page }) => {
    await navigateToEmailLogin(page);

    const forgotBtn = page.getByText('Forgot password?', { exact: true });
    await expect(forgotBtn).toBeVisible();
    await forgotBtn.click();

    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
    await forgotBtn.click();

    await expect(page.getByText('Do you want to reset the password for usman.dk11@yahoo.com?')).toBeVisible();
    await page.locator('button[aria-label="Close"]').click();
    await expect(page.getByRole('button', { name: 'LOG IN' })).toBeVisible();
  });

});
