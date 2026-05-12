import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function WatchListPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    async function fetchGamesList() {
        setLoading(true);
        setError(false);
        try {
            const MEU_TOKEN = "kscIqVFJTa9iPFZ3HPuSkaEOCSJL-oHK3UMXzc4xxDE";

            const response = await fetch(
                "https://pi5-api-production.up.railway.app/api/v1/games?page=1&page_size=20",
                {
                    method: "GET",
                    headers: {
                        "accept": "application/json",
                        "Authorization": `Bearer ${MEU_TOKEN}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar a lista de partidas");
            }

            const data = await response.json();
            setGames(data.items || []);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchGamesList();
    }, []);

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
            <h1 style={{ marginBottom: "20px" }}>Selecione a Partida</h1>

            <p style={{ color: "#636e72", marginBottom: "30px" }}>
                Lista das últimas partidas geradas no servidor.
            </p>

            <button
                onClick={fetchGamesList}
                style={{ marginBottom: "20px", padding: "10px 20px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc" }}
            >
                Atualizar Lista
            </button>

            {loading && <p>A carregar partidas...</p>}
            {error && <p className="error-text">Erro ao carregar as partidas. Verifique o seu token.</p>}

            {!loading && !error && games.length === 0 && (
                <p>Nenhuma partida encontrada.</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {games.map((game) => (
                    <div
                        key={game.id}
                        className="game-card"
                    >
                        <div className="game-card-content">
                            <h3>
                                {game.turing_player?.group_name || "Bot 1"} vs {game.lovelace_player?.group_name || "Bot 2"}
                            </h3>
                            <p>
                                {game.status === "FINISHED" ? (
                                    <span>
                                        Vencedor: <strong>
                                            {game.winner_player_id === game.turing_player?.id
                                                ? game.turing_player?.group_name
                                                : game.lovelace_player?.group_name}
                                        </strong>
                                    </span>
                                ) : (
                                    <span>Status: <strong>{game.status}</strong> | Turno: {game.current_turn_number}</span>
                                )}
                            </p>
                        </div>

                        <Link
                            to={`/watch/${game.id}`}
                            className="cta-button"
                            style={{ margin: 0, padding: "10px 20px", fontSize: "1rem" }}
                        >
                            Assistir
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}