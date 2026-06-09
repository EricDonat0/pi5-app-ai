import { useEffect, useState } from "react";
import { GameCard } from "../components/GameCard";
import { api } from "../services/api";
import { PlayerSelect, PLAYERS } from "../components/PlayerSelect";

function getErrorDetail(err) {
    const detail = err?.detail ?? err?.data?.detail ?? err?.data ?? err?.message ?? err;

    if (Array.isArray(detail)) {
        return detail.map((item) => {
            const campo = item?.loc ? item.loc[item.loc.length - 1] : "campo";
            return `${campo}: ${item?.msg || JSON.stringify(item)}`;
        }).join("\n");
    }

    if (typeof detail === "object") {
        return JSON.stringify(detail, null, 2);
    }

    return String(detail || "Erro desconhecido");
}

export function WatchListPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(false);

    const [selectedPlayerId, setSelectedPlayerId] = useState("");
    const [selectedTeamSlot, setSelectedTeamSlot] = useState("1");

    async function fetchGamesList() {
        setLoading(true);
        setError(false);

        try {
            const data = await api.get("/games?page=1&page_size=20");
            setGames(data.items || []);
        } catch (err) {
            console.error("Erro ao buscar lista:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    async function createNewGame() {
        setCreating(true);

        try {
            if (!selectedPlayerId) {
                alert("Erro: Nenhum jogador selecionado no Front-End!");
                return;
            }

            const playerEncontrado = PLAYERS.find(
                p => String(p.id) === String(selectedPlayerId)
            );

            if (!playerEncontrado) {
                alert("Erro: Jogador nao encontrado no sistema!");
                return;
            }

            const teamSlot = Number(selectedTeamSlot);

            if (![1, 2].includes(teamSlot)) {
                alert("Escolha um slot valido: 1 ou 2.");
                return;
            }

            api.setToken(playerEncontrado.token);

            const payload = {
                player_id: playerEncontrado.id,
                team_slot: teamSlot,
                vs_random_bot: true,
            };

            console.log("Enviando pacote para criar partida contra Random Bot:", payload);

            await api.post("/games", payload);
            await fetchGamesList();
        } catch (err) {
            console.error("Erro completo da API:", err);
            alert(`Erro ao criar partida:\n${getErrorDetail(err)}`);
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

            <PlayerSelect
                value={selectedPlayerId}
                onChange={setSelectedPlayerId}
                label="Jogar como:"
                variant="watchlist"
            />

            <div style={{ margin: "20px 0 30px 0", textAlign: "left" }}>
                <label className="player-select-label" style={{ display: "block", marginBottom: "10px" }}>
                    Slot contra Random Bot:
                </label>

                <select
                    className="player-select-dropdown"
                    value={selectedTeamSlot}
                    onChange={(e) => setSelectedTeamSlot(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box" }}
                >
                    <option value="1">Slot 1 / Turing / Primeiro jogador</option>
                    <option value="2">Slot 2 / Lovelace / Segundo jogador</option>
                </select>

                <p style={{ color: "#636e72", fontSize: "0.9rem", marginTop: "8px" }}>
                    Selecione qual posição deseja jogar.
                </p>
            </div>

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
                    Erro ao carregar as partidas. Selecione um jogador e atualize a lista.
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