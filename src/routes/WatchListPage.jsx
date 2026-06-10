import { useEffect, useState } from "react";
import { GameCard } from "../components/GameCard";
import { api } from "../services/api";
import { PLAYERS } from "../components/PlayerSelect";
import "../styles/WatchListPage.css";

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

function getLocalPlayerName(player, fallback) {
    return (
        player?.ai_player_name ||
        player?.group_name ||
        player?.name ||
        player?.nome ||
        player?.label ||
        fallback
    );
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
        <main className="watch-list-page-v3">
            <header className="wl-header">
                <h1 className="wl-title">Selecione a Partida</h1>

                <p className="wl-subtitle">
                    Acompanhe as partidas recentes e inicie novos testes contra o Random Bot.
                </p>
            </header>

            <section className="wl-panel">
                <div className="wl-form-grid">
                    <div className="wl-field">
                        <label className="wl-label" htmlFor="watch-player-select">
                            Jogar como
                        </label>

                        <select
                            id="watch-player-select"
                            className="wl-select"
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                        >
                            <option value="">Selecione um jogador</option>

                            {PLAYERS.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {getLocalPlayerName(player, `Jogador ${player.id}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="wl-field">
                        <label className="wl-label" htmlFor="watch-slot-select">
                            Slot contra Random Bot
                        </label>

                        <select
                            id="watch-slot-select"
                            className="wl-select"
                            value={selectedTeamSlot}
                            onChange={(e) => setSelectedTeamSlot(e.target.value)}
                        >
                            <option value="1">Slot 1 / Turing</option>
                            <option value="2">Slot 2 / Lovelace</option>
                        </select>

                        <p className="wl-helper">
                            Escolha a posição inicial do seu jogador na partida.
                        </p>
                    </div>
                </div>

                <div className="wl-actions">
                    <button
                        onClick={fetchGamesList}
                        className="wl-button wl-button-secondary"
                        disabled={loading}
                        type="button"
                    >
                        {loading ? "Buscando..." : "Atualizar lista"}
                    </button>

                    <button
                        onClick={createNewGame}
                        className="wl-button wl-button-primary"
                        disabled={creating}
                        type="button"
                    >
                        {creating ? "Iniciando..." : "Nova partida"}
                    </button>
                </div>
            </section>

            {loading && games.length === 0 && (
                <p className="wl-status">A carregar partidas...</p>
            )}

            {error && (
                <p className="wl-status">
                    Erro ao carregar as partidas. Selecione um jogador e atualize a lista.
                </p>
            )}

            {!loading && !error && games.length === 0 && (
                <p className="wl-status">Nenhuma partida encontrada.</p>
            )}

            <section className="wl-games">
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </section>
        </main>
    );
}