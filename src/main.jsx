import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { BattlePage } from './routes/BattlePage';

const root = document.querySelector("#root");
createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);