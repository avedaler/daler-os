import { useState } from "react";
import { C, FONT } from "../constants";
import { Check, Field } from "./atoms";

export default function TaskFilter() {
  const [task, setTask] = useState("");
  const [f, setF] = useState([false, false, false, false]);
  const qs = ["Увеличивает капитал", "Защищает капитал", "Увеличивает стоимость бизнеса", "Усиливает влияние / репутацию"];
  const pass = f.some(Boolean);
  return (
    <div>
      <Field label="Задача / возможность" value={task} onChange={setTask} placeholder="Например: новый партнёрский запрос…" />
      {qs.map((q, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <Check on={f[i]} onClick={() => setF(f.map((v, j) => (j === i ? !v : v)))} />
          <span style={{ fontSize: 14, color: C.ivory }}>{q}</span>
        </div>
      ))}
      {task.trim() && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 4, border: `1px solid ${pass ? C.green : C.red}`, color: pass ? C.green : C.red, fontSize: 13, fontFamily: FONT.mono }}>
          {pass ? "ПРОХОДИТ ФИЛЬТР — в приоритеты" : "НЕ ПРОХОДИТ — делегировать, отложить или отказаться"}
        </div>
      )}
    </div>
  );
}
