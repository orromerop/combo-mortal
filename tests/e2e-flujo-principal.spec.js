const { test, expect } = require('@playwright/test');

// Flujo principal: menu -> checkout -> cocina -> admin(entregado)
test('flujo principal E2E', async ({ page }) => {
  await page.goto('http://localhost:3080/#menu');

  // 1) Agregar producto desde menu
  await page.locator('button[data-action="menu-add"]').first().click();

  // 2) Pagar pedido
  await page.click('a[href="#checkout"]');
  await expect(page).toHaveURL(/#checkout/);

  await page.fill('input[data-action="datos-pago"]', '4111111111111111');
  await page.click('button[data-action="checkout-confirm"]');
  await expect(page).toHaveURL(/#orden\//);

  const orderNumber = (await page.locator('h1').first().innerText()).trim();
  expect(orderNumber).toMatch(/^#A-2026-/);

  // 3) Marcar listo en cocina
  await page.click('button[data-action="go-cocina"]');
  await expect(page).toHaveURL(/#cocina/);

  const cocinaPedido = page
    .locator('button[data-action="cocina-select"]')
    .filter({ hasText: orderNumber })
    .first();
  await cocinaPedido.click();

  await page.locator('select[data-action="cocina-draft"]').first().selectOption({ label: 'Listo' });
  await page.locator('button[data-action="cocina-save"]').first().click();

  // 4) Marcar entregado en admin
  await page.click('a[href="#admin"]');
  await expect(page).toHaveURL(/#admin/);

  await page.click('button[data-action="admin-filtro"][data-value="TODOS"]');
  const row = page.locator('tr').filter({ hasText: orderNumber }).first();
  await expect(row).toBeVisible();

  const entregar = row.locator('button[data-action="admin-confirm"]');
  if ((await entregar.count()) > 0) {
    await entregar.click();
    await page.locator('button[data-action="admin-yes"]').first().click();
  }

  await page.click('button[data-action="admin-filtro"][data-value="ENTREGADO"]');
  await expect(page.locator('tr').filter({ hasText: orderNumber }).first()).toBeVisible();

  // 5) Evidencia local de corrida
  await page.screenshot({ path: 'docs/evidencia-e2e-playwright-test.png', fullPage: true });
});
