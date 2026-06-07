import { test, expect } from '@playwright/test';

const value = (page) => page.locator('#value');
const expression = (page) => page.locator('#expression');
const themeLabel = (page) => page.locator('#themeLabel');

async function clickDigit(page, digit) {
  await page.locator(`button[data-action="digit"][data-digit="${digit}"]`).click();
}

async function clickOperator(page, op) {
  await page.locator(`button[data-action="operator"][data-op="${op}"]`).click();
}

async function clickEquals(page) {
  await page.locator('button[data-action="equals"]').click();
}

async function clickClear(page) {
  await page.locator('button[data-action="clear"]').click();
}

async function clickDecimal(page) {
  await page.locator('button[data-action="decimal"]').click();
}

async function clickBackspace(page) {
  await page.locator('button[data-action="backspace"]').click();
}

async function clickPercent(page) {
  await page.locator('button[data-action="percent"]').click();
}

async function clickThemeToggle(page) {
  await page.locator('#themeToggle').click();
}

async function clickJournalClear(page) {
  await page.locator('#journalClear').click();
}

test.describe('Калькулятор — E2E тесты', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Начальное состояние', () => {
    test('показывает 0 при загрузке', async ({ page }) => {
      await expect(value(page)).toHaveText('0');
      await expect(expression(page)).toHaveText('');
    });
  });

  test.describe('Ввод чисел', () => {
    test('вводит число по кнопкам', async ({ page }) => {
      await clickDigit(page, '1');
      await clickDigit(page, '2');
      await clickDigit(page, '3');

      await expect(value(page)).toHaveText('123');
    });
  });

  test.describe('Десятичные числа', () => {
    test('вводит десятичное число с запятой', async ({ page }) => {
      await clickDigit(page, '3');
      await clickDecimal(page);
      await clickDigit(page, '1');
      await clickDigit(page, '4');

      await expect(value(page)).toHaveText('3,14');
    });
  });

  test.describe('Операции', () => {
    test('складывает два числа', async ({ page }) => {
      await clickDigit(page, '5');
      await clickOperator(page, '+');
      await clickDigit(page, '3');
      await clickEquals(page);

      await expect(value(page)).toHaveText('8');
      await expect(expression(page)).toHaveText('5 + 3 =');
    });

    test('вычитает два числа', async ({ page }) => {
      await clickDigit(page, '9');
      await clickOperator(page, '-');
      await clickDigit(page, '4');
      await clickEquals(page);

      await expect(value(page)).toHaveText('5');
      await expect(expression(page)).toHaveText('9 − 4 =');
    });

    test('умножает два числа', async ({ page }) => {
      await clickDigit(page, '6');
      await clickOperator(page, '*');
      await clickDigit(page, '7');
      await clickEquals(page);

      await expect(value(page)).toHaveText('42');
      await expect(expression(page)).toHaveText('6 × 7 =');
    });

    test('делит два числа', async ({ page }) => {
      await clickDigit(page, '8');
      await clickOperator(page, '/');
      await clickDigit(page, '2');
      await clickEquals(page);

      await expect(value(page)).toHaveText('4');
      await expect(expression(page)).toHaveText('8 ÷ 2 =');
    });

    test('показывает выражение при выборе операции', async ({ page }) => {
      await clickDigit(page, '5');
      await clickOperator(page, '+');

      await expect(value(page)).toHaveText('5');
      await expect(expression(page)).toHaveText('5 +');
    });

    test('выполняет цепочку операций без равно', async ({ page }) => {
      await clickDigit(page, '5');
      await clickOperator(page, '+');
      await clickDigit(page, '3');
      await clickOperator(page, '*');

      await expect(value(page)).toHaveText('8');
      await expect(expression(page)).toHaveText('8 ×');
    });
  });

  test.describe('Сброс и backspace', () => {
    test('кнопка C сбрасывает калькулятор', async ({ page }) => {
      await clickDigit(page, '9');
      await clickOperator(page, '+');
      await clickDigit(page, '1');
      await clickClear(page);

      await expect(value(page)).toHaveText('0');
      await expect(expression(page)).toHaveText('');
    });

    test('backspace удаляет последнюю цифру', async ({ page }) => {
      await clickDigit(page, '1');
      await clickDigit(page, '2');
      await clickDigit(page, '3');
      await clickBackspace(page);

      await expect(value(page)).toHaveText('12');
    });

    test('backspace оставляет 0 при одной цифре', async ({ page }) => {
      await clickDigit(page, '7');
      await clickBackspace(page);

      await expect(value(page)).toHaveText('0');
    });

    test('backspace после оператора сбрасывает калькулятор', async ({ page }) => {
      await clickDigit(page, '5');
      await clickOperator(page, '+');
      await clickBackspace(page);

      await expect(value(page)).toHaveText('0');
      await expect(expression(page)).toHaveText('');
    });
  });

  test.describe('Процент', () => {
    test('преобразует число в процент', async ({ page }) => {
      await clickDigit(page, '5');
      await clickDigit(page, '0');
      await clickPercent(page);

      await expect(value(page)).toHaveText('0,5');
    });
  });

  test.describe('Ошибки', () => {
    test('деление на ноль показывает «Ошибка»', async ({ page }) => {
      await clickDigit(page, '5');
      await clickOperator(page, '/');
      await clickDigit(page, '0');
      await clickEquals(page);

      await expect(value(page)).toHaveText('Ошибка');
      await expect(expression(page)).toHaveText('');
    });
  });

  test.describe('Журнал операций', () => {
    test('добавляет запись после вычисления', async ({ page }) => {
      await clickDigit(page, '2');
      await clickOperator(page, '+');
      await clickDigit(page, '2');
      await clickEquals(page);

      const entry = page.locator('.journal-entry').first();
      await expect(entry.locator('.journal-entry-expr')).toHaveText('2 + 2 =');
      await expect(entry.locator('.journal-entry-result')).toHaveText('= 4');
    });

    test('очищает журнал по кнопке «Очистить»', async ({ page }) => {
      await clickDigit(page, '3');
      await clickOperator(page, '+');
      await clickDigit(page, '3');
      await clickEquals(page);

      await expect(page.locator('.journal-entry')).toHaveCount(1);

      await clickJournalClear(page);

      await expect(page.locator('.journal-entry')).toHaveCount(0);
      await expect(page.locator('.journal-empty')).toBeVisible();
    });
  });

  test.describe('Тема оформления', () => {
    test('переключает на светлую тему', async ({ page }) => {
      await expect(themeLabel(page)).toHaveText('Тёмная тема');

      await clickThemeToggle(page);

      await expect(themeLabel(page)).toHaveText('Светлая тема');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('переключает обратно на тёмную тему', async ({ page }) => {
      await clickThemeToggle(page);
      await clickThemeToggle(page);

      await expect(themeLabel(page)).toHaveText('Тёмная тема');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('сохраняет тему после перезагрузки', async ({ page }) => {
      await clickThemeToggle(page);
      await page.reload();

      await expect(themeLabel(page)).toHaveText('Светлая тема');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });
  });
});
