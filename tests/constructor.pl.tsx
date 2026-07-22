import { test, expect } from '@playwright/test';

const MOCK_USER = {
  success: true,
  user: {
    email: 'user@yandex.ru',
    name: 'Nikita'
  }
};

const MOCK_ORDER = {
  success: true,
  order: {
    number: 21213
  }
};

test.describe('Тестирование функциональности конструктора бургеров', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.routeFromHAR('tests/hars/api.har', {
      updateContent: 'embed',
      notFound: 'fallback'
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({ json: MOCK_USER });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({ json: MOCK_ORDER });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'mocked-refresh-token');
    });

    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer%20mocked-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto('/');
  });

  test('Добавление ingredients в конструктор бургера', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first();
    await bunCard.getByRole('button', { name: /добавить/i }).click();

    await page.waitForTimeout(200);

    const mainCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Биокотлета из марсианской XL-говядины' })
      .first();
    await mainCard.getByRole('button', { name: /добавить/i }).click();

    const constructorSection = page
      .locator('section')
      .filter({ hasText: /Оформить заказ/i })
      .first();
    await expect(constructorSection).toContainText('Краторная булка N-200i');
    await expect(constructorSection).toContainText(
      'Биокотлета из марсианской XL-говядины'
    );
  });

  test('Работа модальных окон описания ingredients', async ({ page }) => {
    await page.getByText('Краторная булка N-200i').click();

    const modal = page.locator('#modals');
    await expect(modal).toContainText('Детали ингредиента');
    await expect(modal).toContainText('Краторная булка N-200i');

    await modal.locator('button').first().click();
    await expect(modal).toBeEmpty();

    await page.waitForTimeout(200);

    await page.getByText('Краторная булка N-200i').click();
    await expect(modal).toContainText('Детали ингредиента');

    await page.mouse.click(10, 10);
    await expect(modal).toBeEmpty();
  });

  test('Полный цикл создания заказа с авторизацией', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first();
    await bunCard.getByRole('button', { name: /добавить/i }).click();

    await page.waitForTimeout(200);

    const mainCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Биокотлета из марсианской XL-говядины' })
      .first();
    await mainCard.getByRole('button', { name: /добавить/i }).click();

    await page.getByRole('button', { name: /оформить заказ/i }).click();

    const modal = page.locator('#modals');
    const orderNumberString = String(MOCK_ORDER.order.number);
    await expect(modal).toContainText(orderNumberString);

    await modal.locator('button').first().click();
    await expect(modal).toBeEmpty();

    const constructorSection = page
      .locator('section')
      .filter({ hasText: /Оформить заказ/i })
      .first();
    await expect(constructorSection).toContainText('Выберите булки');
    await expect(constructorSection).toContainText('Выберите начинку');
  });
});