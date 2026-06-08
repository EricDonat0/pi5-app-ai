import './styles/global.css';
import './styles/header-footer.css';
import './styles/board.css';
import './styles/pages.css';
import { BrowserRouter, Routes, Route } from "react-router";
import { useState } from "react";
import { AppLayout } from "./app-layout";
import { HomePage } from "@/routes/HomePage";
import { WatchListPage } from "@/routes/WatchListPage";
import { WatchGamePage } from "@/routes/WatchGamePage";
import { BattlePage } from "@/routes/BattlePage";
import { RegisterPage } from "@/routes/RegisterPage";

export function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/watch" element={<WatchListPage />} />
                    <Route path="/watch/:id" element={<WatchGamePage />} />

                    <Route path="/registro" element={<RegisterPage />} />
                    
                    <Route path="/battle" element={<BattlePage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}