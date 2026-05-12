import { useEffect, useState } from "react";
import { GameCard } from "../components/GameCard";

export function WatchListPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(false);

    const MEU_TOKEN = "kscIqVFJTa9iPFZ3HPuSkaEOCSJL-oHK3UMXzc4xxDE";

    // Busca a lista de partidas
    async function fetchGamesList() {
        setLoading(true);
        setError(false);
        try {
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

            if (!response.ok) throw new Error("Erro ao buscar a lista de partidas");

            const data = await response.json();
            setGames(data.items || []);
        } catch (err) {
            console.error("Erro ao buscar lista:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    // Cria uma nova partida com os campos que a API exigiu
    async function createNewGame() {
        setCreating(true);
        try {
            const payload = {
                player_id: 21,        // Mudado de player_1_id para player_id
                team_slot: 1,         // Novo campo exigido pela API
                vs_random_bot: true
            };

            console.log("Tentando criar com:", payload);

            const response = await fetch("https://pi5-api-production.up.railway.app/api/v1/games", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${MEU_TOKEN}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchGamesList();
            } else {
                const errorData = await response.json();
                console.log("Erro completo da API:", errorData);

                let errorMessage = "Erro desconhecido";
                if (typeof errorData.detail === "string") {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(err => {
                        const campo = err.loc ? err.loc[err.loc.length - 1] : "campo";
                        return `${campo}: ${err.msg}`;
                    }).join("\n");
                }

                alert(`Erro ao criar partida:\n${errorMessage}`);
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro de conexão ao tentar criar a partida.");
        } finally {
            setCreating(false);
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

            <div className="list-controls">
                <button
                    onClick={fetchGamesList}
                    className="secondary-button"
                    disabled={loading}
                >
                    {loading ? "Buscando..." : "Atualizar Lista"}
                </button>

                <button
                    onClick={createNewGame}
                    className="cta-button"
                    disabled={creating}
                >
                    {creating ? "Iniciando..." : "Nova Partida"}
                </button>
            </div>

            {loading && games.length === 0 && <p>A carregar partidas...</p>}

            {error && (
                <p className="error-text">
                    Erro ao carregar as partidas. Verifique se o seu token ainda é válido.
                </p>
            )}

            {!loading && !error && games.length === 0 && (
                <p>Nenhuma partida encontrada.</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </div>
        </div>
    );
}