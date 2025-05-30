# gowish-e2e-test
# GoWish E2E Test with Playwright

This repository contains end-to-end (E2E) tests for GoWish.com using Playwright.

##  What It Does
- Logs into the website
- Adds a product to a wishlist
- Archives the wishlist
- Verifies login errors and forgot password flow

##  How to Run Locally

1. Clone the repository:
- git clone https://github.com/usmankhandk/gowish-e2e-test.git
- cd gowish-e2e-test

2. Install dependencies:
- npm install
- npx playwright install

3. Run tests:
- npx playwright test

4. View HTML test report:
- npx playwright show-report

##  CI/CD

Tests run automatically on every push using GitHub Actions.

---
##  Improvements & Known Limitations

Page Object Model (POM) is not implemented due to time constraints. Refactoring with POM will improve test scalability and maintainability.
Some tests may be flaky due to dynamic elements or timing issues. Stability can be improved using proper waits. Even though they pass in UI/headed mode. If a test fails in CI, please rerun — retries are built-in to recover from transient failures.



Author: [usmankhandk](https://github.com/usmankhandk)
