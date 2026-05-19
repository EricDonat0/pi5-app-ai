import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
// Importamos o componente e a lista!
import { PlayerSelect, PLAYERS } from "../components/PlayerSelect";

export function BattlePage() {
    const navigate = useNavigate();

    const [selectedPlayerId, setSelectedPlayerId] = useState("");
    const [opponentId, setOpponentId] = useState("");
    const [creating, setCreating] = useState(false);

    async function handleChallenge(e) {
        e.preventDefault();
        setCreating(true);

        try {
            if (!selectedPlayerId) {
                alert("Erro: Selecione o seu lutador na lista primeiro!");
                setCreating(false);
                return;
            }

            const playerEncontrado = PLAYERS.find(p => String(p.id) === String(selectedPlayerId));

            if (!playerEncontrado) {
                alert("Erro: Jogador não encontrado no sistema!");
                setCreating(false);
                return;
            }

            if (!opponentId) {
                alert("Digite o ID do grupo adversário!");
                setCreating(false);
                return;
            }

            const payload = {
                player_id: playerEncontrado.id,
                opponent_id: parseInt(opponentId),
                team_slot: 1,
                vs_random_bot: false
            };

            const response = await api.post("/games", payload);
            const responseData = response.data || response;

            if (responseData && responseData.id) {
                navigate(`/watch/${responseData.id}`);
            } else {
                navigate("/watch");
            }

        } catch (err) {
            console.error("Erro ao desafiar:", err);
            let errorMessage = "Erro ao criar a batalha.";
            if (err?.detail) {
                errorMessage = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
            }
            alert(`Falha no combate:\n${errorMessage}`);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", textAlign: "center" }}>
            <h1 style={{ color: "#ff4757", fontSize: "2.5rem", margin: "0 0 10px 0" }}>⚔️ Arena de Batalha</h1>
            <p className="hero-subtitle" style={{ marginBottom: "40px" }}>
                Prepare seu bot para o torneio. Insira o ID do adversário e inicie o combate.
            </p>

            <form onSubmit={handleChallenge} className="battle-form-container">

                {/* O NOVO COMPONENTE EM AÇÃO AQUI */}
                <PlayerSelect
                    value={selectedPlayerId}
                    onChange={setSelectedPlayerId}
                    label="1. Selecione o seu lutador:"
                />

                <div style={{ marginBottom: "40px", textAlign: "left" }}>
                    <label className="player-select-label" style={{ display: "block", marginBottom: "10px" }}>
                        2. ID do Grupo Adversário:
                    </label>
                    <input
                        type="number"
                        placeholder="Ex: 42"
                        className="player-select-dropdown"
                        value={opponentId}
                        onChange={(e) => setOpponentId(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={creating}
                    className="cta-button btn-danger"
                    style={{ width: "100%", padding: "20px" }}
                >
                    {creating ? "GERANDO ARENA..." : "ENTRAR EM COMBATE"}
                </button>
            </form>
        </div>
    );
}