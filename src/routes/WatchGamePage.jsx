import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BoardCell } from "../components/BoardCell";
import { WinnerBanner } from "../components/WinnerBanner";

export function WatchGamePage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    async function fetchGame() {
        setError(false);
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
            if (!data) setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!id) return;
        fetchGame();

        const intervalId = setInterval(() => {
            fetchGame();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [id]);

    return (
        <div style={{ padding: "0 20px" }}>
            <h1 style={{ textAlign: "center", marginTop: "20px" }}>Assistindo Jogo #{id}</h1>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Link to="/watch" style={{ textDecoration: "none", fontWeight: "bold" }}>
                    &lt; Voltar para a lista
                </Link>
            </div>

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
                        <div className="board-grid">
                            {data.board.map((row, rowIndex) =>
                                row.map((cell, colIndex) => (
                                    <BoardCell
                                        key={`${rowIndex}-${colIndex}`}
                                        level={cell.level}
                                        professor={cell.professor}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {data.status === "FINISHED" && (
                        <WinnerBanner
                            winnerName={data.winner_player_id === data.turing_player?.id
                                ? data.turing_player?.group_name
                                : data.lovelace_player?.group_name}
                        />
                    )}
                </div>
            )}
        </div>
    );
}