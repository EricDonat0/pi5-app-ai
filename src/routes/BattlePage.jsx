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

function sameId(a, b) {
    if (a === undefined || a === null || b === undefined || b === null) {
        return false;
    }

    return String(a) === String(b);
}

function getGameRoot(game) {
    return game?.game ?? game;
}

function getTuringId(game) {
    const root = getGameRoot(game);

    return (
        root?.turing_player?.id ??
        root?.turing_player_id ??
        null
    );
}

function getLovelaceId(game) {
    const root = getGameRoot(game);

    return (
        root?.lovelace_player?.id ??
        root?.lovelace_player_id ??
        null
    );
}

function getPlayerSlot(game, playerId) {
    const root = getGameRoot(game);

    if (!root || !playerId) {
        return null;
    }

    const turingId = getTuringId(root);
    const lovelaceId = getLovelaceId(root);

    if (sameId(playerId, turingId)) {
        return 1;
    }

    if (sameId(playerId, lovelaceId)) {
        return 2;
    }

    const possiblePlayersArrays = [
        root?.players,
        root?.game_players,
        root?.participants,
    ];

    for (const players of possiblePlayersArrays) {
        if (!Array.isArray(players)) continue;

        for (const item of players) {
            const id =
                item?.id ??
                item?.player_id ??
                item?.ai_player_id ??
                item?.player?.id;

            const slot =
                item?.team_slot ??
                item?.slot ??
                item?.team ??
                item?.side;

            if (sameId(id, playerId) && slot !== undefined && slot !== null) {
                const parsedSlot = Number(slot);
                return Number.isInteger(parsedSlot) ? parsedSlot : null;
            }
        }
    }

    return null;
}

function collectPlayerIdsFromGame(game) {
    const root = getGameRoot(game);
    const ids = new Set();

    [
        root?.turing_player?.id,
        root?.lovelace_player?.id,
        root?.turing_player_id,
        root?.lovelace_player_id,
        root?.player?.id,
        root?.player_id,
        root?.opponent?.id,
        root?.opponent_id,
        root?.opponent_player?.id,
        root?.opponent_player_id,
    ].forEach((id) => {
        if (id !== undefined && id !== null) {
            ids.add(Number(id));
        }
    });

    const possiblePlayersArrays = [
        root?.players,
        root?.game_players,
        root?.participants,
    ];

    for (const players of possiblePlayersArrays) {
        if (!Array.isArray(players)) continue;

        players.forEach((player) => {
            const id =
                typeof player === "object"
                    ? player?.id ?? player?.player_id ?? player?.ai_player_id ?? player?.player?.id
                    : player;

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

async function createGameWithSlot(playerId, myTeamSlot) {
    const createPayloads = [
        {
            player_id: playerId,
            team_slot: myTeamSlot,
            vs_random_bot: false,
        },
        {
            player_id: playerId,
            team_slot: String(myTeamSlot),
            vs_random_bot: false,
        },
    ];

    return postTryingPayloads("/games", createPayloads);
}

async function joinOpponent(gameId, opponentPlayerId, opponentTeamSlot) {
    const joinPayloads = [
        {
            player_id: opponentPlayerId,
            team_slot: opponentTeamSlot,
        },
        {
            player_id: opponentPlayerId,
            team_slot: String(opponentTeamSlot),
        },
        {
            opponent_id: opponentPlayerId,
            team_slot: opponentTeamSlot,
        },
        {
            opponent_player_id: opponentPlayerId,
            team_slot: opponentTeamSlot,
        },
    ];

    // Quando o adversario deve ir para o slot 2, algumas APIs aceitam só player_id.
    // Quando o adversario deve ir para o slot 1, não usamos fallback sem slot,
    // porque isso poderia mascarar o bug de lado invertido.
    if (Number(opponentTeamSlot) === 2) {
        joinPayloads.push({ player_id: opponentPlayerId });
    }

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

        // Algumas APIs ja iniciam automaticamente depois do join.
        // Nesse caso, nao bloqueamos a navegacao.
        if (
            err?.status === 400 &&
            (
                detail.includes("already") ||
                detail.includes("started") ||
                detail.includes("inici")
            )
        ) {
            return null;
        }

        throw err;
    }
}

function logSlotDebug(currentGame, myPlayerId, opponentPlayerId, myTeamSlot, opponentTeamSlot) {
    console.table({
        my_player_id: myPlayerId,
        opponent_player_id: opponentPlayerId,

        requested_my_slot: myTeamSlot,
        requested_opponent_slot: opponentTeamSlot,

        actual_my_slot: getPlayerSlot(currentGame, myPlayerId),
        actual_opponent_slot: getPlayerSlot(currentGame, opponentPlayerId),

        turing_player_id: getTuringId(currentGame),
        lovelace_player_id: getLovelaceId(currentGame),
    });
}

function validateSlotsOrThrow(currentGame, myPlayerId, opponentPlayerId, myTeamSlot, opponentTeamSlot) {
    const actualMySlot = getPlayerSlot(currentGame, myPlayerId);
    const actualOpponentSlot = getPlayerSlot(currentGame, opponentPlayerId);

    if (actualMySlot !== null && actualMySlot !== Number(myTeamSlot)) {
        throw new Error(
            `O backend ignorou ou inverteu o slot do seu jogador. ` +
            `Voce pediu slot ${myTeamSlot}, mas ele entrou no slot ${actualMySlot}. ` +
            `Isso indica problema no backend/orquestrador ou endpoint /games.`
        );
    }

    if (actualOpponentSlot !== null && actualOpponentSlot !== Number(opponentTeamSlot)) {
        throw new Error(
            `O backend ignorou ou inverteu o slot do adversario. ` +
            `Voce pediu slot ${opponentTeamSlot}, mas ele entrou no slot ${actualOpponentSlot}. ` +
            `Isso indica problema no backend/orquestrador ou endpoint /join.`
        );
    }
}

export function BattlePage() {
    const navigate = useNavigate();

    const [selectedPlayerId, setSelectedPlayerId] = useState("");
    const [opponentId, setOpponentId] = useState("");
    const [myTeamSlot, setMyTeamSlot] = useState("1");
    const [creating, setCreating] = useState(false);

    async function handleChallenge(e) {
        e.preventDefault();
        setCreating(true);

        try {
            const myPlayerId = parsePlayerId(selectedPlayerId);
            const opponentPlayerId = parsePlayerId(opponentId);
            const selectedSlot = Number(myTeamSlot);
            const opponentSlot = selectedSlot === 1 ? 2 : 1;

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

            if (![1, 2].includes(selectedSlot)) {
                alert("Escolha um slot valido: 1 ou 2.");
                return;
            }

            api.setToken(playerEncontrado.token);

            const createPayloadPreview = {
                player_id: myPlayerId,
                team_slot: selectedSlot,
                vs_random_bot: false,
            };

            console.log("Criando partida:", createPayloadPreview);
            const createdGame = await createGameWithSlot(myPlayerId, selectedSlot);
            const gameId = getGameId(createdGame);

            if (!gameId) {
                throw new Error(
                    `A API criou a partida, mas nao retornou o id: ${JSON.stringify(createdGame)}`
                );
            }

            let currentGame = createdGame;

            if (!gameContainsPlayer(currentGame, opponentPlayerId)) {
                console.log(
                    `Adicionando jogador adversario ${opponentPlayerId} ` +
                    `no slot ${opponentSlot} da partida ${gameId}`
                );

                const joinedGame = await joinOpponent(gameId, opponentPlayerId, opponentSlot);
                currentGame = joinedGame || currentGame;
            }

            try {
                currentGame = await api.get(`/games/${gameId}`);
            } catch (err) {
                console.warn("Nao foi possivel confirmar a partida antes do start:", err);
            }

            logSlotDebug(currentGame, myPlayerId, opponentPlayerId, selectedSlot, opponentSlot);

            if (!gameContainsPlayer(currentGame, opponentPlayerId)) {
                throw new Error(
                    "A partida foi criada, mas o adversario nao entrou. " +
                    "Isso normalmente acontece quando a API exige o token do jogador adversario " +
                    "ou quando o endpoint /join nao aceita entrada por ID."
                );
            }

            validateSlotsOrThrow(
                currentGame,
                myPlayerId,
                opponentPlayerId,
                selectedSlot,
                opponentSlot
            );

            try {
                await startGameIfPossible(gameId, myPlayerId);
            } catch (err) {
                console.warn(
                    "Nao foi possivel iniciar automaticamente. " +
                    "A partida pode ja estar iniciada ou aguardando start manual.",
                    err
                );
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
            <h1 style={{ color: "#ff4757", fontSize: "2.5rem", margin: "0 0 10px 0" }}>
                Arena de Batalha
            </h1>

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

                <div style={{ marginBottom: "40px", textAlign: "left" }}>
                    <label className="player-select-label" style={{ display: "block", marginBottom: "10px" }}>
                        3. Escolha o lado do seu jogador:
                    </label>

                    <select
                        className="player-select-dropdown"
                        value={myTeamSlot}
                        onChange={(e) => setMyTeamSlot(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box" }}
                    >
                        <option value="1">Slot 1 / Turing / Primeiro jogador</option>
                        <option value="2">Slot 2 / Lovelace / Segundo jogador</option>
                    </select>

                    <p style={{ color: "#636e72", fontSize: "0.9rem", marginTop: "8px" }}>
                        Escolha seus professores.
                    </p>
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