# c2-calk

Браузерный калькулятор с журналом операций, тёмной/светлой темой и автотестами.

## Команды

```powershell
npm test              # unit-тесты (Vitest)
npm run test:e2e      # E2E-тесты (Playwright)
npm run test:e2e:report  # HTML-отчёт E2E
npm start             # локальный сервер → http://localhost:4173/
```

## Деплой на Vercel

Проект — статический сайт (`calculator.html`), сборка не нужна.

### Через GitHub (рекомендуется)

1. Залейте репозиторий на GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → импорт `c2-calk`.
3. Настройки (подставятся из `vercel.json`):
   - **Framework Preset:** Other
   - **Build Command:** пусто
   - **Install Command:** пусто
   - **Output Directory:** `.`
4. **Deploy** — сайт откроется по адресу `https://ваш-проект.vercel.app/`.

Приложение лежит в `public/index.html` и открывается по корню `/`.

### Через CLI

```powershell
npx vercel
npx vercel --prod
```

## Журнал разработки

История этапов и шаблон заметок — в папке [`docs/`](docs/):

- [`TEMPLATE-dev-log.md`](docs/TEMPLATE-dev-log.md) — шаблон для новых сводок
- [`26.06.05-CRS-Калькулятор_журнал_тесты-v1.0.md`](docs/26.06.05-CRS-Калькулятор_журнал_тесты-v1.0.md) — сводка текущего этапа
