import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function WatchGamePage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const rows = ["5", "4", "3", "2", "1"];
    const cols = ["A", "B", "C", "D", "E"];

    async function fetchGame() {
        setError(false);
        setLoading(true);
        try {
            const response = await fetch(
                "https://pi5-api-production.up.railway.app/api/v1/games/mock-state",
                { method: "POST" }
            );

            if (!response.ok) throw new Error("Erro ao buscar estado do jogo");

            const game = await response.json();
            setData(game);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!id) return;
        fetchGame();
    }, [id]);

    return (
        <div>
            <h1>Assistindo Jogo #{id}</h1>
            <Link to="/watch">&lt; Voltar</Link>

            <div className="status-container">
                {error && <span className="error-text">Erro ao carregar o jogo.</span>}
                {loading && <span>Carregando...</span>}
            </div>

            {data && data.board && (
                <div className="game-wrapper">

                    {/* Painel de Informações */}
                    <div className="game-info-panel">
                        <div><strong>Turno:</strong> {data.turn_number || 0}</div>
                        <div>
                            <strong>Última Jogada:</strong>{" "}
                            {data.last_move ? (
                                <span>{data.last_move.professor} moveu.</span>
                            ) : (
                                <span>Fase de Setup</span>
                            )}
                        </div>
                    </div>

                    {/* Container do Tabuleiro + Coordenadas */}
                    <div className="board-container">

                        {/* Linha Principal: Números + Grid */}
                        <div className="chessboard-main-row">

                            {/* Números na esquerda */}
                            <div className="row-coordinates">
                                {rows.map(num => (
                                    <div key={num} className="coord-y">
                                        {num}
                                    </div>
                                ))}
                            </div>

                            {/* O Grid do Tabuleiro (CSS corrigido para marginTop: 0) */}
                            <div className="board-grid">
                                {data.board.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => {
                                        const isTeam1 = cell.professor === "CLARO" || cell.professor === "REY";
                                        const teamClass = isTeam1 ? "team-1" : "team-2";

                                        let highlightClass = "";
                                        if (data.last_move) {
                                            const { move_to, mentor_at } = data.last_move;
                                            if (move_to?.row === rowIndex && move_to?.col === colIndex) highlightClass = "highlight-move";
                                            else if (mentor_at?.row === rowIndex && mentor_at?.col === colIndex) highlightClass = "highlight-mentor";
                                        }

                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                className={`board-cell level-${cell.level} ${highlightClass}`}
                                            >
                                                <span className="level-text">Lvl {cell.level}</span>
                                                {cell.professor && (
                                                    <div className={`professor-badge ${teamClass}`}>
                                                        {cell.professor}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Linha de Letras (A a E) */}
                        <div className="col-coordinates">
                            {cols.map(letra => (
                                <div key={letra} className="coord-x">
                                    {letra}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}