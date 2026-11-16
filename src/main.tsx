import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/premium-typography.css";
import "./styles/supplier-mobile-grids.css";
import { initializePWA } from "@/lib/pwa";

initializePWA();

createRoot(document.getElementById("root")!).render(<App />);
