# DALER OS

Личное операционное приложение: ежедневный ритуал (утро → день → вечер), недельный обзор, CEO-review по пятницам, встроенный астрослой и нумерология. Язык — русский, часовой пояс — Asia/Kuala_Lumpur (UTC+8). PWA, офлайн-first.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production + service worker (dist/)
```

## Деплой на Vercel

```bash
npx vercel dist --prod    # или подключить репозиторий, framework: Vite
```

После деплоя: открыть сайт на iPhone в Safari → Поделиться → «На экран „Домой“».

## Структура

- `src/App.jsx` — шапка-леджер (баланс дня, нумерология), вкладки
- `src/components/` — Morning / Day / Evening / Week / CeoReview / Settings / AstroPanel / ArchitectTimer / TaskFilter
- `src/lib/astro.js` — астрослой: реальные положения планет через `astronomy-engine` (Луна в знаке, фаза, аспекты Луны к Солнцу–Сатурну, ретроградность, переход знака), деловые трактовки на русском
- `src/lib/numerology.js` — личный день/месяц/год (база 3.04) + трактовки 1–9
- `src/lib/store.js` — IndexedDB (`idb-keyval`): `day:YYYY-MM-DD`, `week:YYYY-Www`, `settings`
- `src/lib/notify.js` — локальные напоминания по KL-времени (7:30 утро, Час Архитектора, 21:30 shutdown; настраиваются)
- `src/lib/export.js` — экспорт месяца в Markdown (дни + астрослой + CEO-review)

## Правила продукта (Master OS)

- Signed → Paid → Live → Recurring; «доказательство дня» — факт, не встреча
- Оценка недели: 8–10 — система работает · 6–7 — упростить · <6 — календарь спроектирован неверно
- Без token/web3, соцфункций и интеграций ради интеграций

## Данные

Все записи хранятся локально в IndexedDB устройства, никуда не отправляются. Бэкап — регулярный экспорт месяца в Markdown (вкладка ⚙).
