// Экспорт месяца в Markdown (скачивается файлом).
import { loadDay, listDays, loadWeek } from "./store";
import { prettyDate, isoWeek, MO_NOM } from "./date";
import { dayScore } from "./score";
import { personalDay } from "./numerology";
import { computeAstro, astroToText } from "./astro";
import { migrateDay } from "../constants";

export async function exportMonth(ym) {
  // ym: "YYYY-MM"
  const days = (await listDays()).filter((d) => d.startsWith(ym));
  const [y, m] = ym.split("-").map(Number);
  const lines = [`# DALER OS — ${MO_NOM[m - 1]} ${y}`, ""];
  const weeks = new Set();

  for (const iso of days) {
    const raw = await loadDay(iso);
    if (!raw) continue;
    const s = migrateDay(raw);
    const { pts, max } = dayScore(s);
    const num = personalDay(iso);
    weeks.add(isoWeek(iso));
    lines.push(`## ${prettyDate(iso)} — ${pts}/${max}`);
    lines.push(`Личный день ${num.pd} · месяц ${num.pm} · год ${num.py}`);
    lines.push("");
    const done = s.outcomeStatus === "done" || s.proofDone;
    if (s.primaryOutcome) lines.push(`**Главный результат:** ${s.primaryOutcome}${done ? " ✓" : ` (${s.outcomeStatus || "не закрыт"}${s.missAction ? ` → ${s.missAction}` : ""})`}`);
    if (s.chairmanOnly) lines.push(`**Chairman action** — требовалось личное участие`);
    if (s.stateCat) lines.push(`**Состояние:** ${s.stateCat}`);
    if ((s.refusalChips || []).length) lines.push(`**Отказ дня:** ${s.refusalChips.join(" · ")}`);
    if (s.artifactType) lines.push(`**Артефакт Часа Архитектора:** ${s.artifactType}${s.architectResult ? ` — ${s.architectResult}` : ""}`);
    if (s.body) lines.push(`**Тело:** ${s.body}`);
    if (s.family) lines.push(`**Семья:** ${s.family}`);
    const wins = s.wins.filter((w) => w.trim());
    if (wins.length) {
      lines.push("", "**Победы:**");
      wins.forEach((w) => lines.push(`- ${w}`));
    }
    const h = s.habits || {};
    const habitBits = [
      h.noSmoke && "не курил",
      h.noAlcohol && "не пил",
      h.biceps && "бицепс",
      h.chest && "грудь",
      h.logic && "логика",
      h.hobby && `хобби: ${h.hobby}`,
    ].filter(Boolean);
    if (habitBits.length) lines.push(`**Дисциплина:** ${habitBits.join(" · ")}`);
    if (h.comfortExit) lines.push(`**Зона комфорта:** ${h.comfortExit}`);
    if (h.social) lines.push(`**Встреча в кругах:** ${h.social}`);
    if (s.value) lines.push(`**Увеличило стоимость:** ${s.value}`);
    if (s.noise) lines.push(`**Шум:** ${s.noise}`);
    if (s.tomorrow) lines.push(`**Главное решение завтра:** ${s.tomorrow}`);
    lines.push("", "**Астрослой:**", "```", astroToText(computeAstro(iso)), "```");
    if (s.astro) lines.push("**Прогноз (вставленный):**", "", s.astro);
    lines.push("");
  }

  for (const w of [...weeks].sort()) {
    const r = await loadWeek(w);
    if (!r) continue;
    lines.push(`## CEO-review · ${w}`);
    if (r.facts) lines.push(`**Факты (цифры недели):** ${r.facts}`);
    if (r.gap) lines.push(`**Разрыв история/реальность:** ${r.gap}`);
    if (r.bottleneck) lines.push(`**Узкое место:** ${r.bottleneck}`);
    if (r.subtraction) lines.push(`**Вычитание:** ${r.subtraction}`);
    if (r.nextWeek) lines.push(`**Следующая неделя:** ${r.nextWeek}`);
    lines.push("");
  }

  const md = lines.join("\n");
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daler-os-${ym}.md`;
  a.click();
  URL.revokeObjectURL(url);
  return days.length;
}
