import { useState } from "react";
import { C, FONT } from "../constants";
import Week from "./Week";
import CeoReview from "./CeoReview";
import { weekday } from "../lib/date";

export default function Overview({ date }) {
  const [sub, setSub] = useState("week");
  const isFriday = weekday(date) === 5;
  const btn = (k, label) => (
    <button key={k} onClick={() => setSub(k)} className={sub === k ? "on" : ""}>{label}</button>
  );
  return (
    <>
      <div className="seg">
        {btn("week", "Неделя")}
        {btn("ceo", isFriday ? "CEO-review ●" : "CEO-review")}
      </div>
      {sub === "week" && <Week date={date} />}
      {sub === "ceo" && <CeoReview date={date} />}
    </>
  );
}
