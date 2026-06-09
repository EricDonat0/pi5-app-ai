import { api } from "../services/api";

export const PLAYERS = [
    // Atualizado para o ID 131
    { id: 131, name: "PalermaBot (Arena API)", token: import.meta.env.VITE_API_TOKEN_PALERMABOT },
    { id: 134, name: "Palerma_Lookahead_V2_Turbo_VTEC", token: import.meta.env.VITE_API_TOKEN_PALERMA_LOOKAHEAD_V2_TURBO_VTEC }
];

export function PlayerSelect({ value, onChange, label, variant = "arena" }) {
    
    function handleChange(event) {
        const val = event.target.value;
        if (!val) return;
        
        const newId = parseInt(val);
        const playerEncontrado = PLAYERS.find(p => p.id === newId);
        if (playerEncontrado) {
            api.setToken(playerEncontrado.token);
        }
        onChange(newId);
    }

    // VISUAL 1: Exclusivo para a WatchListPage (Caixa horizontal)
    if (variant === "watchlist") {
        return (
            <div className="player-select-container">
                <label className="player-select-label">{label}</label>
                <select className="player-select-dropdown" value={value} onChange={handleChange}>
                    <option value="" disabled>-- Selecione o Jogador --</option>
                    {PLAYERS.map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                </select>
            </div>
        );
    }

    // VISUAL 2: Padrão para a Arena de Batalha (Esticado com label em cima)
    return (
        <div style={{ marginBottom: "25px", textAlign: "left" }}>
            <label className="player-select-label" style={{ display: "block", marginBottom: "10px" }}>
                {label}
            </label>
            <select className="player-select-dropdown" value={value} onChange={handleChange} style={{ width: "100%" }}>
                <option value="" disabled>-- Selecione o Jogador --</option>
                {PLAYERS.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                ))}
            </select>
        </div>
    );
}