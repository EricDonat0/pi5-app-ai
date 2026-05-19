import { useEffect, useState } from "react";
import { GameCard } from "../components/GameCard";
import { api } from "../services/api";

// 1. SUA NOVA LISTA DE JOGADORES (Você pode adicionar quantos quiser aqui)
const PLAYERS = [
    {
        id: 21,
        name: "PalermaBot (Principal)",
        token: import.meta.env.VITE_API_TOKEN
    },
    {
        id: 78,
        name: "Eriguei (Teste)",
        token: import.meta.env.VITE_API_TOKEN_ERIGUEI
    }
];

export function WatchListPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(false);

    // 2. Estado para guardar qual jogador está selecionado agora
    const [selectedPlayer, setSelectedPlayer] = useState(PLAYERS);

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
            // 1. Verificação de segurança: garante que temos um jogador selecionado
            if (!selectedPlayer || !selectedPlayer.id) {
                alert("Erro: Nenhum jogador selecionado no Front-End!");
                setCreating(false);
                return;
            }

            // 2. Monta o pacote de dados (Payload)
            const payload = {
                player_id: selectedPlayer.id, // <-- Ele puxa o ID do jogador selecionado na caixinha
                team_slot: 1,
                vs_random_bot: true
            };

            // 3. Imprime no F12 para a gente ter certeza do que está saindo do seu PC
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

    // 4. Função que roda quando você troca o jogador no menu dropdown
    function handlePlayerChange(event) {
        const playerId = parseInt(event.target.value);
        const playerEncontrado = PLAYERS.find(p => p.id === playerId);

        setSelectedPlayer(playerEncontrado);
        api.setToken(playerEncontrado.token); // Avisa a API para usar o token
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

            {/* A CAIXINHA DE SELEÇÃO DE JOGADOR COM CLASSES CSS */}
            <div className="player-select-container">
                <label className="player-select-label">
                    Jogar como:
                </label>
                <select
                    className="player-select-dropdown"
                    value={selectedPlayer.id}
                    onChange={handlePlayerChange}
                >
                    {PLAYERS.map(player => (
                        <option key={player.id} value={player.id}>
                            {player.name}
                        </option>
                    ))}
                </select>
            </div>

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