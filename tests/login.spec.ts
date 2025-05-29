import { test, expect, Page } from '@playwright/test';

// ✅ Reusable login navigation
async function navigateToEmailLogin(page: Page) {
  await page.goto('https://gowish.com/en');
  await expect(page).toHaveTitle(/GoWish/);
  await expect(page.getByRole('heading', { name: 'All your wishes in one place' })).toBeVisible();

  //const declineButton = page.getByRole('button', { name: 'Decline all' });
  const declineButton = page.locator('button.coi-consent-banner__decline-button');

  if (await declineButton.isVisible({ timeout: 2000 })) {
    await declineButton.click();
    await expect(declineButton).toHaveCount(0);
  }

  const loginButton = page.getByRole('button', { name: 'Log in' });
  await loginButton.click();
  const continueEmail = page.getByText('Continue with e-mail', { exact: true });
  await continueEmail.click();
}
test('E2E: Add Philips Trimmer Multi to My Wishlist from Matas brand', async ({ page }) => {
  // Step 1: Go to homepage and log in
  await page.goto('https://gowish.com/en');
  await expect(page).toHaveTitle(/GoWish/);

  const declineAll = page.getByRole('button', { name: 'Decline all' });
  if (await declineAll.isVisible({ timeout: 2000 })) {
    await declineAll.click();
  }

  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByText('Continue with e-mail', { exact: true }).click();

  await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
  await page.getByPlaceholder('Password').fill('Denmark123@');
  await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();

  await page.waitForURL('**/overview');
  await expect(page.getByText('Muhammad Usman')).toBeVisible();

  // Step 2: Go to Matas brand
  const viewAllBrands = page.locator('text=Brands').locator('xpath=following::button[contains(., "View all")][1]');
  await viewAllBrands.click();
  await page.waitForURL('**/for-you/brands');

  await page.locator('input[placeholder="Search brand"]').fill('matas');
  const matasTile = page.locator('img[src*="540b7295792942a58d5f.png"]').locator('xpath=ancestor::div[contains(@class, "BrandItem__BrandImageContainer")][1]');
  await expect(matasTile).toBeVisible();
  await matasTile.click();

  // Step 3: Add Philips Trimmer Multi to wishlist
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


// Locate the success toast
const successToast = page.locator('text=Wish created successfully in My wishlist');

// Step 1: Ensure it appears
await expect(successToast).toBeVisible;

// Step 2: Wait until it disappears from the DOM
//await expect(successToast).not.toBeVisible;
await successToast.waitFor({ state: 'detached' });





// Navigate to wishlist overview
await page.waitForTimeout(2000);
 
await page.getByTestId('navbarWishlists').click();
await expect(page).toHaveURL('https://gowish.com/overview');

// Wait for *any* visible wishlist title
const myWishlist = page.locator('[data-cy^="wishlistTitle-"]').filter({ hasText: 'My wishlist' });
await expect(myWishlist).toBeVisible; 
await myWishlist.first().click();


await page.waitForTimeout(2000);
 
 // Step: Open the wishlist actions menu (typically a "More" or dots button)
const moreMenuButton = page.locator('button:has(img[alt="More button menu icon"])').first();
await expect(moreMenuButton).toBeVisible;
await moreMenuButton.click();

// Step: Click "Archive wishlist"
const archiveOption = page.getByText('Archive wishlist', { exact: true });
await expect(archiveOption).toBeVisible;
await archiveOption.click({ force: true });

// Define the confirm archive button locator
const confirmArchiveBtn = page.getByRole('button', { name: 'Archive' });

await expect(confirmArchiveBtn).toBeVisible;
await confirmArchiveBtn.waitFor({ state: 'visible' }); // ensure it's fully rendered
//await page.waitForTimeout(10000); // optional buffer for animation
await confirmArchiveBtn.click();


// Step: Wait for archive success message
await expect(page.getByText('Wish archived successfully')).toBeVisible;



});



/*// ✅ Click "..." menu
const moreButton = page.locator('button:has(img[alt="More button menu icon"])').first();
await moreButton.click();

// ✅ Wait for the popover to become visible
const deleteWishMenu = page.locator('div:has-text("Delete wish")').first();
await expect(deleteWishMenu).toBeVisible({ timeout: 3000 });
await deleteWishMenu.click();

// ✅ Wait for and confirm deletion method
const confirmDeleteOption = page.locator('div.DeleteWishModalContent__OptionElement-sc-c5a05b84-0:has-text("Delete wish")');
await expect(confirmDeleteOption).toBeVisible({ timeout: 3000 });
await confirmDeleteOption.click();

// ✅ Wait for and click DELETE confirmation
const finalDeleteButton = page.locator('#button-modal-submit');
await expect(finalDeleteButton).toBeVisible({ timeout: 3000 });
await finalDeleteButton.click();

// ✅ Confirm success toast
await expect(page.locator('text=Wish deleted successfully')).toBeVisible({ timeout: 5000 });*/



// ❌ Invalid email and password
test('Invalid email login shows "not being used" popup and dismisses it', async ({ page }) => {
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

// ❌ Valid email, invalid password
test('Login with valid email and invalid password shows error toast', async ({ page }) => {
  await navigateToEmailLogin(page);

  await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
  await page.getByPlaceholder('Password').fill('WrongPassword123');
  await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();

  const toast = page.getByText('Either the email or password used is incorrect');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveCount(0, { timeout: 5000 });

  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

// ❌ Empty credentials, then fix step by step
test('Login without credentials then fix step-by-step', async ({ page }) => {
  await navigateToEmailLogin(page);

  // Step 1: Submit empty form
  await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();
  await expect(page.getByText('Please enter a valid password')).toBeVisible();

  // Step 2: Enter valid password
  await page.getByPlaceholder('Password').fill('Denmark123@');
  await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();
  await expect(page.getByText('Please enter a valid email address')).toBeVisible();

  // Step 3: Enter valid email and complete login
  await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');
  await page.getByRole('dialog').getByRole('button', { name: 'LOG IN' }).click();

  await Promise.race([
    page.waitForURL('**/overview', { timeout: 5000 }),
    page.getByText('Muhammad Usman').waitFor({ timeout: 5000 }),
  ]);
  await expect(page.getByText('Muhammad Usman')).toBeVisible();

  // Logout
  await page.locator('button[data-cy="navbarUserProfileAvatar"]').click();
  await page.getByRole('button', { name: 'LOG OUT' }).click();
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

// 🔄 Forgot password flow
test('Forgot password flow with validation and email confirmation', async ({ page }) => {
  await navigateToEmailLogin(page);

  const forgotButton = page.getByText('Forgot password?', { exact: true });
  await expect(forgotButton).toBeVisible();
  await forgotButton.click();

  await expect(page.getByText('Please enter a valid email address')).toBeVisible();

  // Fill in valid email
  await page.getByPlaceholder('Email').fill('usman.dk11@yahoo.com');

  const forgotButtonAgain = page.getByText('Forgot password?', { exact: true });
  await expect(forgotButtonAgain).toBeVisible();
  await forgotButtonAgain.click();

  // Validate email in confirmation
  await expect(page.getByText('Do you want to reset the password for usman.dk11@yahoo.com?')).toBeVisible();

  // Close modal by clicking the X icon
  await page.locator('button[aria-label="Close"]').click();

  // Confirm dialog is closed and login button is back
  await expect(page.getByRole('button', { name: 'LOG IN' })).toBeVisible();
});