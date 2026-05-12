import { Link } from "react-router-dom";

export function Navbar({ isDark, setIsDark }) {
    return (
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
                    {isDark ? "Modo Claro" : "Modo Escuro"}
                </button>
            </div>
        </header>
    );
}