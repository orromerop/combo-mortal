const { test, expect } = require('@playwright/test');

// Prueba negativa: la interfaz debe fallar cuando platillos.json es invalido.
test('falla de interfaz por JSON invalido', async ({ page }) => {
  await page.goto(`http://localhost:3080/?broken=${Date.now()}#menu`);

  await expect(page.locator('h1')).toHaveText('Error de datos');
  await expect(page.locator('.error')).toContainText('No se pudo iniciar');

  // No debe existir el boton principal del flujo de menu.
  await expect(page.locator('button[data-action="menu-add"]').first()).toHaveCount(0);

  await page.screenshot({
    path: 'docs/evidencia-e2e-falla-json-invalido-test.png',
    fullPage: true,
  });
});
