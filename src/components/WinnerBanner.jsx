export function WinnerBanner({ winnerName }) {
    return (
        <div className="winner-banner">
            <div className="winner-banner-title">Partida Finalizada</div>
            <div className="winner-banner-subtitle">
                Vencedor:
                <span className="winner-name">{winnerName}</span>
            </div>
        </div>
    );
}