import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { PlayerSelect, PLAYERS } from "../components/PlayerSelect";

function parsePlayerId(value) {
    const text = String(value).trim();

    if (!/^\d+$/.test(text)) {
        return null;
    }

    const parsed = Number.parseInt(text, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getGameId(response) {
    return response?.id ?? response?.game_id ?? response?.game?.id ?? null;
}

function collectPlayerIdsFromGame(game) {
    const ids = new Set();

    [
        game?.turing_player?.id,
        game?.lovelace_player?.id,
        game?.turing_player_id,
        game?.lovelace_player_id,
        game?.player?.id,
        game?.player_id,
        game?.opponent?.id,
        game?.opponent_id,
        game?.opponent_player?.id,
        game?.opponent_player_id,
        game?.game?.turing_player?.id,
        game?.game?.lovelace_player?.id,
        game?.game?.turing_player_id,
        game?.game?.lovelace_player_id,
    ].forEach((id) => {
        if (id !== undefined && id !== null) {
            ids.add(Number(id));
        }
    });

    if (Array.isArray(game?.players)) {
        game.players.forEach((player) => {
            const id = typeof player === "object" ? player?.id : player;
            if (id !== undefined && id !== null) {
                ids.add(Number(id));
            }
        });
    }

    if (Array.isArray(game?.game?.players)) {
        game.game.players.forEach((player) => {
            const id = typeof player === "object" ? player?.id : player;
            if (id !== undefined && id !== null) {
                ids.add(Number(id));
            }
        });
    }

    return ids;
}

function gameContainsPlayer(game, playerId) {
    if (!game) return false;
    return collectPlayerIdsFromGame(game).has(Number(playerId));
}

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

    return String(detail || "Erro desconhecido ao criar a batalha.");
}

function shouldTryNextPayload(err) {
    return err?.status === 400 || err?.status === 422;
}

async function postTryingPayloads(endpoint, payloads) {
    let lastError = null;

    for (const payload of payloads) {
        try {
            return await api.post(endpoint, payload);
        } catch (err) {
            lastError = err;

            if (!shouldTryNextPayload(err)) {
                throw err;
            }
        }
    }

    throw lastError;
}

async function joinOpponent(gameId, opponentPlayerId) {
    const joinPayloads = [
        { player_id: opponentPlayerId, team_slot: 2 },
        { player_id: opponentPlayerId },
        { opponent_id: opponentPlayerId, team_slot: 2 },
        { opponent_player_id: opponentPlayerId, team_slot: 2 },
    ];

    return postTryingPayloads(`/games/${gameId}/join`, joinPayloads);
}

async function startGameIfPossible(gameId, playerId) {
    const startPayloads = [
        undefined,
        {},
        { player_id: playerId },
    ];

    try {
        return await postTryingPayloads(`/games/${gameId}/start`, startPayloads);
    } catch (err) {
        const detail = getErrorDetail(err).toLowerCase();

        // Algumas APIs ja iniciam automaticamente depois do join; nesse caso nao bloqueamos a navegacao.
        if (
            err?.status === 400 &&
            (detail.includes("already") || detail.includes("started") || detail.includes("inici"))
        ) {
            return null;
        }

        throw err;
    }
}

export function BattlePage() {
    const navigate = useNavigate();

    const [selectedPlayerId, setSelectedPlayerId] = useState("");
    const [opponentId, setOpponentId] = useState("");
    const [creating, setCreating] = useState(false);

    async function handleChallenge(e) {
        e.preventDefault();
        setCreating(true);

        try {
            const myPlayerId = parsePlayerId(selectedPlayerId);
            const opponentPlayerId = parsePlayerId(opponentId);

            if (!myPlayerId) {
                alert("Erro: Selecione o seu lutador na lista primeiro!");
                return;
            }

            const playerEncontrado = PLAYERS.find(p => Number(p.id) === myPlayerId);

            if (!playerEncontrado) {
                alert("Erro: Jogador nao encontrado no sistema!");
                return;
            }

            if (!opponentPlayerId) {
                alert("Digite um ID numerico valido para o jogador adversario!");
                return;
            }

            if (opponentPlayerId === myPlayerId) {
                alert("O adversario precisa ser diferente do seu proprio jogador.");
                return;
            }

            api.setToken(playerEncontrado.token);

            // Primeiro cria uma partida sem bot aleatorio. O segundo jogador entra no passo /join.
            const createPayload = {
                player_id: myPlayerId,
                team_slot: 1,
                vs_random_bot: false
            };

            console.log("Criando partida:", createPayload);
            const createdGame = await api.post("/games", createPayload);
            const gameId = getGameId(createdGame);

            if (!gameId) {
                throw new Error(`A API criou a partida, mas nao retornou o id: ${JSON.stringify(createdGame)}`);
            }

            let currentGame = createdGame;

            if (!gameContainsPlayer(currentGame, opponentPlayerId)) {
                console.log(`Adicionando jogador adversario ${opponentPlayerId} na partida ${gameId}`);
                const joinedGame = await joinOpponent(gameId, opponentPlayerId);
                currentGame = joinedGame || currentGame;
            }

            // Confirmacao defensiva: busca a partida atualizada antes de iniciar.
            try {
                currentGame = await api.get(`/games/${gameId}`);
            } catch (err) {
                console.warn("Nao foi possivel confirmar a partida antes do start:", err);
            }

            if (!gameContainsPlayer(currentGame, opponentPlayerId)) {
                throw new Error(
                    "A partida foi criada, mas o adversario nao entrou no segundo slot. " +
                    "Isso normalmente acontece quando a API exige o token do jogador adversario ou quando o endpoint /join nao aceita entrada por ID."
                );
            }

            try {
                await startGameIfPossible(gameId, myPlayerId);
            } catch (err) {
                console.warn("Nao foi possivel iniciar automaticamente. A partida pode ja estar iniciada ou aguardando start manual.", err);
            }

            navigate(`/watch/${gameId}`);
        } catch (err) {
            console.error("Erro completo ao desafiar:", err);
            alert(`Falha no combate:\n${getErrorDetail(err)}`);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", textAlign: "center" }}>
            <h1 style={{ color: "#ff4757", fontSize: "2.5rem", margin: "0 0 10px 0" }}>Arena de Batalha</h1>
            <p className="hero-subtitle" style={{ marginBottom: "40px" }}>
                Prepare seu bot para o torneio. Insira o ID do adversario e inicie o combate.
            </p>

            <form onSubmit={handleChallenge} className="battle-form-container">
                <PlayerSelect
                    value={selectedPlayerId}
                    onChange={setSelectedPlayerId}
                    label="1. Selecione o seu lutador:"
                />

                <div style={{ marginBottom: "40px", textAlign: "left" }}>
                    <label className="player-select-label" style={{ display: "block", marginBottom: "10px" }}>
                        2. ID do Jogador Adversario:
                    </label>
                    <input
                        type="number"
                        min="1"
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