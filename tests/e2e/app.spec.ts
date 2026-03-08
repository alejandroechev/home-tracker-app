import { test, expect } from '@playwright/test';

test.describe('HomeTracker App', () => {
  test('home page loads with title and 4 nav tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('HomeTracker')).toBeVisible();

    const nav = page.locator('nav');
    await expect(nav.getByRole('button', { name: 'Inicio' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Nuevo' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Mantenciones' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Historial' })).toBeVisible();
  });

  test('navigate between pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('HomeTracker')).toBeVisible();

    await page.getByRole('button', { name: 'Nuevo' }).click();
    await expect(page.getByText('Nuevo Evento')).toBeVisible();

    await page.getByRole('button', { name: 'Mantenciones' }).click();
    await expect(page.getByRole('heading', { name: 'Mantenciones' })).toBeVisible();
    await expect(page.getByText('No hay mantenciones programadas')).toBeVisible();

    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();

    await page.getByRole('button', { name: 'Inicio' }).click();
    await expect(page.getByText('No hay eventos registrados')).toBeVisible();
  });

  test('create an event', async ({ page }) => {
    await page.goto('/');

    // Navigate to Nuevo tab
    await page.getByRole('button', { name: 'Nuevo' }).click();
    await expect(page.getByText('Nuevo Evento')).toBeVisible();

    // Type is already "Reparación" by default

    // Fill title
    await page.getByPlaceholder('Describe brevemente el evento').fill('Arreglar llave');

    // Fill description
    await page.getByPlaceholder('Detalles adicionales...').fill('Test');

    // Create a new area "Cocina" via the area select
    // Create a new area "Cocina" via the area select
    // The area select shows "Seleccionar área..." as default
    await page.getByText('Seleccionar área...').locator('..').selectOption('__create__');
    await page.getByPlaceholder('Nombre del área').fill('Cocina');
    await page.getByRole('button', { name: 'Crear' }).click();

    // Set priority to high (Alta)
    // Priority select has options: Baja, Media, Alta, Urgente
    const prioritySelect = page.locator('select').filter({ hasText: 'Alta' });
    await prioritySelect.selectOption('high');

    // Submit the form
    await page.getByRole('button', { name: 'Guardar Evento' }).click();

    // Should redirect to inicio and show the event
    await expect(page.getByText('Eventos recientes')).toBeVisible();
    await expect(page.getByText('Arreglar llave')).toBeVisible();
  });

  test('view event in history', async ({ page }) => {
    await page.goto('/');

    // First create an event
    await page.getByRole('button', { name: 'Nuevo' }).click();
    await page.getByPlaceholder('Describe brevemente el evento').fill('Pintar pared');
    await page.getByPlaceholder('Detalles adicionales...').fill('Test historial');

    // Create area
    await page.getByText('Seleccionar área...').locator('..').selectOption('__create__');
    await page.getByPlaceholder('Nombre del área').fill('Living');
    await page.getByRole('button', { name: 'Crear' }).click();

    await page.getByRole('button', { name: 'Guardar Evento' }).click();
    await expect(page.getByText('Eventos recientes')).toBeVisible();

    // Navigate to Historial
    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();
    await expect(page.getByText('Pintar pared')).toBeVisible();
  });

  test('back button works', async ({ page }) => {
    await page.goto('/');

    // On inicio, back button should NOT be visible
    await expect(page.getByRole('button', { name: 'Volver' })).not.toBeVisible();

    // Navigate to Nuevo
    await page.getByRole('button', { name: 'Nuevo' }).click();
    await expect(page.getByText('Nuevo Evento')).toBeVisible();

    // Back button should now be visible
    await expect(page.getByRole('button', { name: 'Volver' })).toBeVisible();

    // Click back
    await page.getByRole('button', { name: 'Volver' }).click();

    // Should return to inicio
    await expect(page.getByText('No hay eventos registrados')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Volver' })).not.toBeVisible();
  });
});
