import { Link } from "react-router-dom";

function sameId(a, b) {
    if (a === undefined || a === null || b === undefined || b === null) {
        return false;
    }

    return String(a) === String(b);
}

function getPlayerName(player, fallback) {
    return (
        player?.ai_player_name ||
        player?.group_name ||
        player?.name ||
        fallback
    );
}

function getWinnerId(game) {
    return (
        game?.winner_player_id ??
        game?.winner_id ??
        game?.winner?.id ??
        game?.winner_player?.id ??
        game?.game?.winner_player_id ??
        game?.game?.winner_id ??
        null
    );
}

function getTuringPlayer(game) {
    return game?.turing_player ?? game?.game?.turing_player ?? null;
}

function getLovelacePlayer(game) {
    return game?.lovelace_player ?? game?.game?.lovelace_player ?? null;
}

function getTuringId(game) {
    return (
        game?.turing_player?.id ??
        game?.turing_player_id ??
        game?.game?.turing_player?.id ??
        game?.game?.turing_player_id ??
        null
    );
}

function getLovelaceId(game) {
    return (
        game?.lovelace_player?.id ??
        game?.lovelace_player_id ??
        game?.game?.lovelace_player?.id ??
        game?.game?.lovelace_player_id ??
        null
    );
}

function getWinnerName(game, player1Name, player2Name) {
    const winnerId = getWinnerId(game);
    const turingId = getTuringId(game);
    const lovelaceId = getLovelaceId(game);

    if (sameId(winnerId, turingId)) {
        return player1Name;
    }

    if (sameId(winnerId, lovelaceId)) {
        return player2Name;
    }

    return "Indefinido";
}

function isFinished(game) {
    return String(game?.status || "").toUpperCase() === "FINISHED";
}

function Avatar({ player, name }) {
    const avatar = player?.ai_player_avatar;

    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                className="gc-avatar"
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />
        );
    }

    return (
        <div className="gc-avatar gc-avatar-fallback">
            {String(name || "?").slice(0, 1).toUpperCase()}
        </div>
    );
}

function PlayerBlock({ label, player, fallback }) {
    const name = getPlayerName(player, fallback);

    return (
        <div className="gc-player-block">
            <Avatar player={player} name={name} />

            <div className="gc-player-info">
                <span className="gc-player-label">{label}</span>
                <strong className="gc-player-name">{name}</strong>
            </div>
        </div>
    );
}

export function GameCard({ game }) {
    const turingPlayer = getTuringPlayer(game);
    const lovelacePlayer = getLovelacePlayer(game);

    const player1Name = getPlayerName(turingPlayer, "Bot 1");
    const player2Name = lovelacePlayer
        ? getPlayerName(lovelacePlayer, "Jogador 2")
        : "Aguardando adversario";

    const winnerName = getWinnerName(game, player1Name, player2Name);
    const gameId = game?.id ?? game?.game_id ?? game?.game?.id;

    const finished = isFinished(game);
    const statusText = game?.status || "DESCONHECIDO";
    const turnNumber = game?.current_turn_number ?? "-";

    return (
        <article className="game-card gc-card">
            <style>
                {`
                    .gc-card {
                        --gc-card-bg: #ffffff;
                        --gc-card-soft: #f8fafc;
                        --gc-border: rgba(15, 23, 42, 0.12);
                        --gc-text: #0f172a;
                        --gc-muted: #64748b;
                        --gc-accent: #00b894;
                        --gc-accent-2: #00cec9;
                        --gc-shadow: 0 12px 28px rgba(15, 23, 42, 0.10);

                        width: 100%;
                        box-sizing: border-box;
                        background: var(--gc-card-bg);
                        color: var(--gc-text);
                        border: 1px solid var(--gc-border);
                        border-radius: 18px;
                        padding: 16px;
                        box-shadow: var(--gc-shadow);
                        display: block;
                    }

                    .dark-mode .gc-card,
                    body.dark-mode .gc-card {
                        --gc-card-bg: #1f2a32;
                        --gc-card-soft: #121b22;
                        --gc-border: rgba(255, 255, 255, 0.10);
                        --gc-text: #f8fafc;
                        --gc-muted: #a4b0be;
                        --gc-shadow: 0 12px 28px rgba(0, 0, 0, 0.26);
                    }

                    .gc-card-main {
                        width: 100%;
                    }

                    .gc-players {
                        display: grid;
                        grid-template-columns: 1fr auto 1fr;
                        gap: 14px;
                        align-items: center;
                    }

                    .gc-player-block {
                        min-width: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .gc-player-block:last-child {
                        justify-content: flex-end;
                        text-align: right;
                    }

                    .gc-avatar {
                        width: 46px;
                        height: 46px;
                        border-radius: 50%;
                        object-fit: cover;
                        flex: 0 0 auto;
                        border: 2px solid rgba(255, 255, 255, 0.18);
                        background: var(--gc-card-soft);
                    }

                    .gc-avatar-fallback {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--gc-text);
                        font-weight: 900;
                        font-size: 1rem;
                    }

                    .gc-player-info {
                        min-width: 0;
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                    }

                    .gc-player-label {
                        color: var(--gc-muted);
                        font-size: 0.68rem;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                    }

                    .gc-player-name {
                        color: var(--gc-text);
                        font-size: 1rem;
                        line-height: 1.18;
                        font-weight: 900;
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }

                    .gc-vs {
                        width: 34px;
                        height: 34px;
                        border-radius: 999px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--gc-muted);
                        background: var(--gc-card-soft);
                        border: 1px solid var(--gc-border);
                        font-size: 0.72rem;
                        font-weight: 900;
                        text-transform: uppercase;
                    }

                    .gc-bottom {
                        margin-top: 14px;
                        display: grid;
                        grid-template-columns: 1fr auto;
                        gap: 12px;
                        align-items: center;
                    }

                    .gc-status {
                        min-width: 0;
                        background: var(--gc-card-soft);
                        border: 1px solid var(--gc-border);
                        border-radius: 12px;
                        padding: 10px 12px;
                        display: flex;
                        flex-direction: column;
                        text-align: left;
                    }

                    .gc-status-label {
                        color: var(--gc-muted);
                        font-size: 0.7rem;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                    }

                    .gc-status-value {
                        color: var(--gc-text);
                        font-size: 0.94rem;
                        line-height: 1.2;
                        font-weight: 900;
                        overflow-wrap: anywhere;
                    }

                    .gc-button {
                        min-width: 150px;
                        min-height: 44px;
                        border-radius: 999px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        text-decoration: none;
                        background: linear-gradient(135deg, var(--gc-accent), var(--gc-accent-2));
                        color: #ffffff;
                        font-size: 0.84rem;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                        box-shadow: 0 8px 22px rgba(0, 206, 201, 0.24);
                    }

                    @media (max-width: 640px) {
                        .gc-card {
                            padding: 13px;
                            border-radius: 15px;
                        }

                        .gc-players {
                            grid-template-columns: 1fr;
                            gap: 8px;
                        }

                        .gc-player-block,
                        .gc-player-block:last-child {
                            justify-content: center;
                            text-align: center;
                            flex-direction: column;
                            gap: 6px;
                        }

                        .gc-avatar {
                            width: 38px;
                            height: 38px;
                        }

                        .gc-player-label {
                            font-size: 0.6rem;
                        }

                        .gc-player-name {
                            font-size: 0.86rem;
                            max-width: 260px;
                            margin: 0 auto;
                        }

                        .gc-vs {
                            width: auto;
                            height: auto;
                            justify-self: center;
                            background: transparent;
                            border: 0;
                            font-size: 0.68rem;
                            line-height: 1;
                            padding: 0;
                            margin: -2px 0;
                        }

                        .gc-bottom {
                            margin-top: 10px;
                            grid-template-columns: 1fr;
                            gap: 9px;
                        }

                        .gc-status {
                            padding: 8px 10px;
                            text-align: center;
                        }

                        .gc-status-label {
                            font-size: 0.62rem;
                        }

                        .gc-status-value {
                            font-size: 0.82rem;
                        }

                        .gc-button {
                            width: 100%;
                            min-width: 0;
                            min-height: 42px;
                            font-size: 0.76rem;
                        }
                    }

                    @media (max-width: 360px) {
                        .gc-card {
                            padding: 11px;
                            border-radius: 13px;
                        }

                        .gc-player-name {
                            font-size: 0.8rem;
                            max-width: 230px;
                        }

                        .gc-status-value {
                            font-size: 0.78rem;
                        }
                    }
                `}
            </style>

            <div className="gc-card-main">
                <div className="gc-players">
                    <PlayerBlock
                        label="Turing"
                        player={turingPlayer}
                        fallback="Bot 1"
                    />

                    <div className="gc-vs">vs</div>

                    <PlayerBlock
                        label="Lovelace"
                        player={lovelacePlayer}
                        fallback="Aguardando adversario"
                    />
                </div>

                <div className="gc-bottom">
                    <div className="gc-status">
                        <span className="gc-status-label">
                            {finished ? "Vencedor" : statusText}
                        </span>

                        <strong className="gc-status-value">
                            {finished ? winnerName : `Turno ${turnNumber}`}
                        </strong>
                    </div>

                    <Link to={`/watch/${gameId}`} className="gc-button">
                        Assistir
                    </Link>
                </div>
            </div>
        </article>
    );
}