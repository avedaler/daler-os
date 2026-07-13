import { useState } from "react";
import { C, FONT } from "../constants";
import Week from "./Week";
import CeoReview from "./CeoReview";
import { weekday } from "../lib/date";

export default function Overview({ date }) {
  const [sub, setSub] = useState("week");
  const isFriday = weekday(date) === 5;
  const btn = (k, label) => (
    <button key={k} onClick={() => setSub(k)} style={{
      padding: "9px 16px", borderRadius: 4, cursor: "pointer", fontSize: 14, minHeight: 42,
      border: `1px solid ${sub === k ? C.gold : C.line}`,
      background: sub === k ? "rgba(200,164,92,.12)" : "transparent",
      color: sub === k ? C.gold : C.muted, fontFamily: FONT.sans,
    }}>{label}</button>
  );
  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {btn("week", "Неделя")}
        {btn("ceo", isFriday ? "CEO-review ●" : "CEO-review")}
      </div>
      {sub === "week" && <Week date={date} />}
      {sub === "ceo" && <CeoReview date={date} />}
    </>
  );
}
