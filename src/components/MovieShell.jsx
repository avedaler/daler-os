import { useState } from "react";
import LockScreen from "./LockScreen";
import MovieV2 from "./MovieV2";
import { hasLock, isUnlockedThisSession } from "../lib/lock";

export default function MovieShell() {
  const [locked, setLocked] = useState(() => hasLock() && !isUnlockedThisSession());
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;
  return <MovieV2 />;
}
