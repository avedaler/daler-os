export function dayScore(s) {
  let pts = 0, max = 10;
  if (s.aff.every(Boolean)) pts++;
  if (s.decl) pts++;
  if (s.proof.trim()) pts++;
  if (s.proofDone) pts++;
  if (s.blocks.office) pts++;
  if (s.blocks.health) pts++;
  if (s.blocks.architect) pts++;
  if (s.blocks.evening) pts++;
  if (s.wins.some((w) => w.trim())) pts++;
  if (s.shutdown) pts++;
  return { pts, max };
}

export function weekVerdict(avg) {
  if (avg >= 8) return { text: "Система работает", color: "green" };
  if (avg >= 6) return { text: "Упростить", color: "gold" };
  return { text: "Календарь спроектирован неверно", color: "red" };
}
