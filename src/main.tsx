import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./ThemeContext";
import App from "./App.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>
);
