import { expect, test, type Page } from '@playwright/test';

const STRAPI = process.env.STRAPI_INTERNAL_URL ?? 'http://localhost:1337';
const TOKEN = process.env.E2E_STRAPI_TOKEN;
// Seeded copy (apps/cms/src/seed/content.ts); the form shows whatever the CMS holds.
const COPY = {
  required: 'Please enter your email',
  invalid: 'Please enter a valid email address',
  success: 'You’re on the list',
};

type Signup = { documentId: string; email: string; source: string };
const created: string[] = [];

function uniqueEmail(tag: string): string {
  const address = `e2e-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  created.push(address);
  return address;
}

async function findSignups(email: string): Promise<Signup[]> {
  const response = await fetch(`${STRAPI}/api/waitlist-signups?filters[email][$eq]=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  expect(response.ok, `Strapi lookup failed (${response.status})`).toBe(true);
  return ((await response.json()) as { data: Signup[] }).data;
}

async function openForm(page: Page) {
  await page.goto('/');
  if ((page.viewportSize()?.width ?? 0) < 992) await page.getByRole('button', { name: 'Open menu' }).click();
  await page
    .getByRole('button', { name: /^Order/ })
    .filter({ visible: true })
    .first()
    .click();
  const dialog = page.locator('[role="dialog"][aria-labelledby="waitlist-title"]');
  await expect(dialog).toBeVisible();
  return dialog;
}

test.afterAll(async () => {
  if (!TOKEN) return;
  for (const email of created) {
    for (const signup of await findSignups(email)) {
      await fetch(`${STRAPI}/api/waitlist-signups/${signup.documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    }
  }
});

test('asks for an email when the field is empty', async ({ page }) => {
  const dialog = await openForm(page);
  await dialog.getByRole('button', { name: /Notify me/ }).click();
  await expect(dialog.getByRole('alert')).toHaveText(COPY.required);
  await expect(dialog.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByRole('textbox')).toBeFocused();
});

test('rejects a malformed address, and typing clears the error', async ({ page }) => {
  const dialog = await openForm(page);
  const field = dialog.getByRole('textbox');
  await field.fill('not-an-email');
  await dialog.getByRole('button', { name: /Notify me/ }).click();
  await expect(dialog.getByRole('alert')).toHaveText(COPY.invalid);
  await field.pressSequentially('x');
  await expect(dialog.getByRole('alert')).toHaveText('');
  await expect(field).not.toHaveAttribute('aria-invalid');
});

test('closes with Escape', async ({ page }) => {
  const dialog = await openForm(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test.describe('with Strapi', () => {
  test.skip(!TOKEN, 'Set E2E_STRAPI_TOKEN to check stored entries (README → End-to-end tests)');

  test('stores a valid signup and shows the success state', async ({ page }, info) => {
    const email = uniqueEmail(info.project.name);
    const dialog = await openForm(page);
    await dialog.getByRole('textbox').fill(email);
    await dialog.getByRole('button', { name: /Notify me/ }).click();
    await expect(dialog.getByRole('status')).toContainText(COPY.success);

    const signups = await findSignups(email);
    expect(signups).toHaveLength(1);
    const viaMenu = ['mobile', 'iphone'].includes(info.project.name);
    expect(signups[0]?.source).toBe(viaMenu ? 'mobile-menu-cta' : 'header-cta');
  });

  test('treats an address already on the list as success, without a second entry', async ({ page }, info) => {
    const email = uniqueEmail(`${info.project.name}-dup`);
    for (let attempt = 0; attempt < 2; attempt++) {
      const dialog = await openForm(page);
      await dialog.getByRole('textbox').fill(email.toUpperCase()); // stored lower-case, so this collides
      await dialog.getByRole('button', { name: /Notify me/ }).click();
      await expect(dialog.getByRole('status')).toContainText(COPY.success);
    }
    expect(await findSignups(email)).toHaveLength(1);
  });

  test('quietly drops submissions that fill the honeypot', async ({ page }, info) => {
    const email = uniqueEmail(`${info.project.name}-bot`);
    const dialog = await openForm(page);
    await dialog.getByRole('textbox').fill(email);
    await dialog.locator('input[name="company"]').fill('Acme Bots');
    await dialog.getByRole('button', { name: /Notify me/ }).click();
    await expect(dialog.getByRole('status')).toContainText(COPY.success);
    expect(await findSignups(email)).toHaveLength(0);
  });
});
