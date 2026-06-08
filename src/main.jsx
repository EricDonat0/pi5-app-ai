import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { BattlePage } from './routes/BattlePage';
import { GameContextProvider } from './feature/game/context/game-context';

const root = document.querySelector("#root");
createRoot(root).render(
    <StrictMode>
        <GameContextProvider>
            <App />
        </GameContextProvider>
    </StrictMode>,
);