import { Link } from "react-router-dom";

function LinkedinIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="linkedin-icon"
            aria-hidden="true"
        >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    );
}

export function HomePage() {
    return (
        <div>
            <div className="hero-section">
                <h1 className="hero-title">PI5: Inteligência Artificial</h1>
                <p className="hero-subtitle">
                    Batalha de algoritmos em um tabuleiro estratégico autônomo.
                </p>
            </div>

            <div className="features-container">
                <div className="feature-card card-api">
                    <h3>🌐 A API Web</h3>
                    <p>Integração de backend que recebe e valida as jogadas do tabuleiro em tempo real.</p>
                </div>

                <div className="feature-card card-ia">
                    <h3>🧠 IA Heurística</h3>
                    <p>Decisões autônomas tomadas por algoritmos baseados em pontuação e bloqueios estratégicos.</p>
                </div>

                <div className="feature-card card-react">
                    <h3>⚛️ O Tabuleiro React</h3>
                    <p>Interface frontend dinâmica que renderiza os níveis, os professores e o histórico de turnos.</p>
                </div>
            </div>

            <section className="team-section">
                <h2>Equipe de Desenvolvimento</h2>

                <div className="team-grid">
                    <a href="https://www.linkedin.com/in/ericdonato/" target="_blank" rel="noopener noreferrer" className="team-member">
                        <LinkedinIcon /> Eric Donato
                    </a>
                    <a href="https://www.linkedin.com/in/paulamorin/" target="_blank" rel="noopener noreferrer" className="team-member">
                        <LinkedinIcon /> Paula Martins
                    </a>
                    <a href="https://www.linkedin.com/in/matheus-henrique-b04a08253/" target="_blank" rel="noopener noreferrer" className="team-member">
                        <LinkedinIcon /> Matheus Henrique
                    </a>
                </div>

                <div className="team-grid advisor-grid">
                    <a href="https://www.linkedin.com/in/guirey/" target="_blank" rel="noopener noreferrer" className="team-member orientador">
                        <LinkedinIcon /> Prof. Guilherme Rey
                    </a>
                </div>
            </section>

            <div className="cta-container">
                <Link to="/watch" className="cta-button">
                    Assistir à Batalha
                </Link>
            </div>
        </div>
    );
}