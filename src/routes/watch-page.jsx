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
            // Seu token do Grupo Palerma
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
            // A API retorna um objeto com "items" contendo o array de jogos
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

            {loading && <p>Carregando partidas...</p>}
            {error && <p className="error-text">Erro ao carregar as partidas. Verifique seu token.</p>}

            {!loading && !error && games.length === 0 && (
                <p>Nenhuma partida encontrada.</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {games.map((game) => (
                    <div
                        key={game.id}
                        style={{
                            background: "#f8f9fa",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #dfe4ea",
                            display: "flex",
                            justifyContent: "space-between", /* CORRIGIDO AQUI! */
                            alignItems: "center"
                        }}
                    >
                        <div style={{ textAlign: "left" }}>
                            <h3 style={{ margin: "0 0 5px 0", color: "#2d3436" }}>
                                {game.turing_player?.group_name || "Bot 1"} vs {game.lovelace_player?.group_name || "Bot 2"}
                            </h3>
                            <p style={{ margin: 0, fontSize: "14px", color: "#636e72" }}>
                                Status: <strong>{game.status}</strong> | Turno: {game.current_turn_number}
                            </p>
                        </div>

                        <Link
                            to={`/watch/${game.id}`}
                            className="cta-button"
                            style={{ margin: 0, padding: "10px 20px", fontSize: "1rem" }}
                        >
                            ▶ Assistir
                        </Link>
                    </div>
                ))}
            </div>
        </div >
    );
}