import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles.css";
import App from "./App";
import MovieShell from "./components/MovieShell";

registerSW({ immediate: true });

const path = window.location.pathname.replace(/\/+$/, "");
const isMovieRoute = path === "/the-movie" || path.endsWith("/the-movie");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isMovieRoute ? <MovieShell /> : <App />}
  </React.StrictMode>
);
