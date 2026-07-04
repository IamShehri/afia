import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Avoid theme flash: apply stored/default theme before first paint.
(() => {
  try {
    const stored = localStorage.getItem("theme");
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    document.documentElement.classList.add("dark");
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
