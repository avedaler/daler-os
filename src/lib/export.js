// Экспорт месяца в Markdown (скачивается файлом).
import { loadDay, listDays, loadWeek } from "./store";
import { prettyDate, isoWeek, MO_NOM } from "./date";
import { dayScore } from "./score";
import { personalDay } from "./numerology";
import { computeAstro, astroToText } from "./astro";
import { emptyDay } from "../constants";

export async function exportMonth(ym) {
  // ym: "YYYY-MM"
  const days = (await listDays()).filter((d) => d.startsWith(ym));
  const [y, m] = ym.split("-").map(Number);
  const lines = [`# DALER OS — ${MO_NOM[m - 1]} ${y}`, ""];
  const weeks = new Set();

  for (const iso of days) {
    const raw = await loadDay(iso);
    if (!raw) continue;
    const s = { ...emptyDay(), ...raw };
    const { pts, max } = dayScore(s);
    const num = personalDay(iso);
    weeks.add(isoWeek(iso));
    lines.push(`## ${prettyDate(iso)} — ${pts}/${max}`);
    lines.push(`Личный день ${num.pd} · месяц ${num.pm} · год ${num.py}`);
    lines.push("");
    if (s.architectQ) lines.push(`**Вопрос Архитектора:** ${s.architectQ}`);
    if (s.proof) lines.push(`**Доказательство дня:** ${s.proof}${s.proofDone ? " ✓" : " (не закрыто)"}`);
    if (s.onlyDaler) lines.push(`**Только Далер:** ${s.onlyDaler}`);
    if (s.refusal) lines.push(`**Отказ дня:** ${s.refusal}`);
    if (s.body) lines.push(`**Тело:** ${s.body}`);
    if (s.family) lines.push(`**Семья:** ${s.family}`);
    const wins = s.wins.filter((w) => w.trim());
    if (wins.length) {
      lines.push("", "**Победы:**");
      wins.forEach((w) => lines.push(`- ${w}`));
    }
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
