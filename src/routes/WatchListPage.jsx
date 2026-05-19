import { useEffect, useState } from "react";
import { GameCard } from "../components/GameCard";
import { api } from "../services/api";
// Importamos o componente e a lista centralizada
import { PlayerSelect, PLAYERS } from "../components/PlayerSelect";

export function WatchListPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(false);

    // Guardamos apenas o ID, começando vazio para forçar a seleção (UX consistente com a Arena)
    const [selectedPlayerId, setSelectedPlayerId] = useState("");

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
            // Verificação baseada no ID selecionado
            if (!selectedPlayerId) {
                alert("Erro: Nenhum jogador selecionado no Front-End!");
                setCreating(false);
                return;
            }

            // Busca os dados completos do jogador usando o ID para enviar no payload
            const playerEncontrado = PLAYERS.find(p => String(p.id) === String(selectedPlayerId));

            if (!playerEncontrado) {
                alert("Erro: Jogador não encontrado no sistema!");
                setCreating(false);
                return;
            }

            const payload = {
                player_id: playerEncontrado.id,
                team_slot: 1,
                vs_random_bot: true
            };

            console.log("Enviando pacote para criar partida:", payload);

            await api.post("/games", payload);
            fetchGamesList();

        } catch (err) {
            console.error("Erro completo da API:", err);
            let errorMessage = "Erro desconhecido";
            if (err && typeof err.detail === "string") {
                errorMessage = err.detail;
            } else if (err && Array.isArray(err.detail)) {
                errorMessage = err.detail.map(e => {
                    const campo = e.loc ? e.loc[e.loc.length - 1] : "campo";
                    return `${campo}: ${e.msg}`;
                }).join("\n");
            }
            alert(`Erro ao criar partida:\n${errorMessage}`);
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

            {/* AGORA ELE SABE QUE DEVE USAR O CSS BONITO DA WATCHLIST */}
            <PlayerSelect
                value={selectedPlayerId}
                onChange={setSelectedPlayerId}
                label="Jogar como:"
                variant="watchlist" 
            />

            <div className="list-controls">
                <button onClick={fetchGamesList} className="secondary-button" disabled={loading}>
                    {loading ? "Buscando..." : "Atualizar Lista"}
                </button>
                <button onClick={createNewGame} className="cta-button" disabled={creating}>
                    {creating ? "Iniciando..." : "Nova Partida"}
                </button>
            </div>

            {loading && games.length === 0 && <p>A carregar partidas...</p>}
            {error && <p className="error-text">Erro ao carregar as partidas. Verifique se o seu token ainda é válido.</p>}
            {!loading && !error && games.length === 0 && <p>Nenhuma partida encontrada.</p>}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </div>
        </div>
    );
}