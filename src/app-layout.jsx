import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function AppLayout({ children = null }) {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <div className={isDark ? "dark-mode" : ""} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", transition: "background-color 0.3s ease, color 0.3s ease" }}>

            {/* NOVO CABEÇALHO (NAVBAR) */}
            <header className="app-header">
                <div className="header-logo">
                    <h1>PI5 - Aplicações de IA</h1>
                </div>

                <nav className="app-nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/watch" className="nav-link">Watch</Link>
                </nav>

                <div className="header-actions">
                    <button
                        className="theme-toggle-btn"
                        onClick={() => setIsDark(!isDark)}
                    >
                        {isDark ? "☀️ Claro" : "🌙 Escuro"}
                    </button>
                </div>
            </header>

            <main style={{ flex: 1 }}>{children}</main>

            {/* NOVO RODAPÉ */}
            <footer className="app-footer">
                <p>&copy; 2026 PI5 - Eric, Paula e Matheus</p>
            </footer>
        </div>
    );
}