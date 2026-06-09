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

export function GameCard({ game }) {
    const turingPlayer = getTuringPlayer(game);
    const lovelacePlayer = getLovelacePlayer(game);

    const player1Name = getPlayerName(turingPlayer, "Bot 1");

    const player2Name = lovelacePlayer
        ? getPlayerName(lovelacePlayer, "Jogador 2")
        : "Aguardando adversario";

    const turingImg = turingPlayer?.ai_player_avatar;
    const lovelaceImg = lovelacePlayer?.ai_player_avatar;

    const winnerName = getWinnerName(game, player1Name, player2Name);
    const gameId = game?.id ?? game?.game_id ?? game?.game?.id;

    return (
        <div className="game-card">
            <div className="game-card-content">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    {turingImg && (
                        <img
                            src={turingImg}
                            alt={player1Name}
                            className="player-avatar"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    )}

                    <h3 style={{ margin: 0 }}>
                        {player1Name}
                        <span style={{ color: "#636e72", fontSize: "0.8em", margin: "0 8px" }}>
                            vs
                        </span>
                        {player2Name}
                    </h3>

                    {lovelaceImg && (
                        <img
                            src={lovelaceImg}
                            alt={player2Name}
                            className="player-avatar"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    )}
                </div>

                <p>
                    {isFinished(game) ? (
                        <span>
                            Vencedor: <strong>{winnerName}</strong>
                        </span>
                    ) : (
                        <span>
                            Status: <strong>{game?.status || "DESCONHECIDO"}</strong> | Turno: {game?.current_turn_number ?? "-"}
                        </span>
                    )}
                </p>
            </div>

            <Link
                to={`/watch/${gameId}`}
                className="cta-button"
                style={{ margin: 0, padding: "10px 20px", fontSize: "1rem" }}
            >
                Assistir
            </Link>
        </div>
    );
}