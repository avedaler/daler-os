import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles.css";
import App from "./App";

let updateSW = () => Promise.resolve();
updateSW = registerSW({
  immediate: true,
  onNeedRefresh: () => updateSW(true),
  onRegisteredSW: (_swUrl, registration) => {
    if (!registration) return;
    const checkForUpdate = () => registration.update().catch(() => {});
    window.setInterval(checkForUpdate, 60000);
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdate();
    });
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
