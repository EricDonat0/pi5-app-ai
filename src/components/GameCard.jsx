import { Link } from "react-router-dom";

export function GameCard({ game }) {
    const turingPlayer = game.turing_player;
    const lovelacePlayer = game.lovelace_player;

    // Lendo o nome do robô ou o nome do grupo corretamente
    const player1Name = turingPlayer?.ai_player_name || turingPlayer?.group_name || "Bot 1";
    const player2Name = lovelacePlayer
        ? (lovelacePlayer?.ai_player_name || lovelacePlayer?.group_name || "Jogador 2")
        : "Aguardando adversario";

    // Lendo o campo exato da foto da API do professor
    const turingImg = turingPlayer?.ai_player_avatar;
    const lovelaceImg = lovelacePlayer?.ai_player_avatar;

    // Lógica para definir quem é o vencedor
    const winnerName = game.winner_player_id === turingPlayer?.id
        ? player1Name
        : (lovelacePlayer ? player2Name : "Indefinido");

    return (
        <div className="game-card">
            <div className="game-card-content">

                {/* Título com as Imagens Reais da API */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>

                    {/* Só renderiza a imagem se ela existir na API */}
                    {turingImg && (
                        <img
                            src={turingImg}
                            alt={player1Name}
                            className="player-avatar"
                            onError={(e) => { e.target.style.display = 'none'; }} // Esconde se a URL estiver quebrada
                        />
                    )}

                    <h3 style={{ margin: 0 }}>
                        {player1Name} <span style={{ color: "#636e72", fontSize: "0.8em", margin: "0 8px" }}>vs</span> {player2Name}
                    </h3>

                    {/* Só renderiza a imagem se ela existir na API */}
                    {lovelaceImg && (
                        <img
                            src={lovelaceImg}
                            alt={player2Name}
                            className="player-avatar"
                            onError={(e) => { e.target.style.display = 'none'; }} // Esconde se a URL estiver quebrada
                        />
                    )}
                </div>

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