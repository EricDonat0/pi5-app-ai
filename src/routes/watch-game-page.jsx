import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function WatchGamePage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const rows = ["5", "4", "3", "2", "1"];
    const cols = ["A", "B", "C", "D", "E"];

    async function fetchGame() {
        setError(false);

        // Removemos o setLoading(true) daqui para evitar o flickering
        try {
            const MEU_TOKEN = "kscIqVFJTa9iPFZ3HPuSkaEOCSJL-oHK3UMXzc4xxDE";

            const response = await fetch(
                `https://pi5-api-production.up.railway.app/api/v1/games/${id}`,
                {
                    method: "GET",
                    headers: {
                        "accept": "application/json",
                        "Authorization": `Bearer ${MEU_TOKEN}`
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) throw new Error("Erro 401: Token inválido.");
                if (response.status === 404) throw new Error("Erro 404: Jogo não encontrado.");
                throw new Error("Erro ao buscar estado do jogo");
            }

            const game = await response.json();
            setData(game);
        } catch (err) {
            console.error(err);
            // Só exibe erro se ainda não tivermos dados na tela
            if (!data) setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!id) return;

        // Primeira busca imediata
        fetchGame();

        // Loop de atualização a cada 2 segundos
        const intervalId = setInterval(() => {
            fetchGame();
        }, 2000);

        // Limpeza do intervalo ao desmontar o componente
        return () => clearInterval(intervalId);
    }, [id]);

    return (
        <div style={{ padding: "0 20px" }}>
            <h1 style={{ textAlign: "center", marginTop: "20px" }}>Assistindo Jogo #{id}</h1>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Link to="/watch" style={{ textDecoration: "none", fontWeight: "bold" }}>&lt; Voltar para a lista</Link>
            </div>

            {/* A mensagem de carregamento só aparece na primeira carga */}
            {loading && !data && (
                <div className="status-container">
                    <span>Iniciando conexão com a arena...</span>
                </div>
            )}

            {error && (
                <div className="status-container">
                    <span className="error-text">Erro ao carregar os dados da partida.</span>
                </div>
            )}

            {data && data.board && (
                <div className="game-wrapper">

                    <div className="game-info-panel">
                        <div><strong>Turno:</strong> {data.current_turn_number}</div>
                        <div><strong>Status:</strong> {data.status}</div>
                        <div>
                            <strong>Fase:</strong> {data.current_turn_phase === "setup_placement" ? "Setup" : "Batalha"}
                        </div>
                    </div>

                    <div className="board-container">
                        <div className="chessboard-main-row">
                            <div className="row-coordinates">
                                {rows.map(num => (
                                    <div key={num} className="coord-y">{num}</div>
                                ))}
                            </div>

                            <div className="board-grid">
                                {data.board.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => {
                                        const isTeam1 = cell.professor === "CLARO" || cell.professor === "REY";
                                        const teamClass = isTeam1 ? "team-1" : "team-2";

                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                className={`board-cell level-${cell.level}`}
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

                        <div className="col-coordinates">
                            {cols.map(letra => (
                                <div key={letra} className="coord-x">{letra}</div>
                            ))}
                        </div>
                    </div>

                    {data.status === "FINISHED" && (
                        <div style={{ marginTop: "20px", padding: "15px", background: "#fd79a8", color: "white", borderRadius: "10px", fontWeight: "bold", textAlign: "center" }}>
                            🏆 Partida Finalizada!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}