import { Link } from "react-router-dom";

export function GameCard({ game }) {
    // Extraindo os nomes para facilitar a leitura
    const player1Name = game.turing_player?.group_name || "Bot 1";
    const player2Name = game.lovelace_player?.group_name || "Bot 2";

    // Lógica para definir quem é o vencedor
    const winnerName = game.winner_player_id === game.turing_player?.id
        ? player1Name
        : player2Name;

    return (
        <div className="game-card">
            <div className="game-card-content">
                <h3>{player1Name} vs {player2Name}</h3>

                <p>
                    {game.status === "FINISHED" ? (
                        <span>
                            Vencedor: <strong>{winnerName}</strong>
                        </span>
                    ) : (
                        <span>
                            Status: <strong>{game.status}</strong> | Turno: {game.current_turn_number}
                        </span>
                    )}
                </p>
            </div>

            <Link
                to={`/watch/${game.id}`}
                className="cta-button"
                style={{ margin: 0, padding: "10px 20px", fontSize: "1rem" }}
            >
                Assistir
            </Link>
        </div>
    );
}