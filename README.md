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

---

# ASITA MODULES

Этот репозиторий теперь является канонической кодовой базой для **Asita Daler OS** и интегрированных модулей.

## Daler OS

- Основной домен: `daler.asita.ai`
- Текущий рабочий модуль: ежедневная операционная система
- Существующие данные Daler OS нельзя автоматически переосмысливать как данные других модулей

## RCMND by Asita

RCMND — private-first система памяти о местах, личного журнала опыта, контекстных рекомендаций и контролируемого обмена рекомендациями.

- Каноническое имя: **RCMND by Asita**
- Канонический домен: `rcmnd.asita.ai`
- Fallback route: `/rcmnd`
- Предыдущее рабочее название: IntelFlow
- Документация: [`docs/rcmnd/README.md`](./docs/rcmnd/README.md)
- Первая задача Codex: [`docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`](./docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md)

RCMND должен развиваться внутри этого репозитория как модуль Asita, а не как отдельный fork с дублирующими authentication, design system, PWA, privacy, AI и deployment слоями.

## Codex

Codex должен сначала читать корневой [`AGENTS.md`](./AGENTS.md), затем документацию активного модуля.

Для RCMND запрещено начинать широкую разработку до завершения Task 00, который обязан:

- сохранить и проверить существующий Daler OS;
- создать rollback reference;
- добавить quality scripts и CI;
- создать module registry и host resolver;
- добавить отключённый по умолчанию RCMND shell;
- подготовить database, privacy, provider и secure server boundaries;
- составить план первого private capture vertical slice.

## Документация Asita

Общий индекс:

[`docs/README.md`](./docs/README.md)
