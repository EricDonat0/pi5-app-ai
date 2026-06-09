import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BoardCell } from "../components/BoardCell";
import { api } from "../services/api";

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

function getWinnerName(game) {
    const winnerId = getWinnerId(game);

    const turingId = getTuringId(game);
    const lovelaceId = getLovelaceId(game);

    const turingName = getPlayerName(game?.turing_player, "Jogador 1");
    const lovelaceName = getPlayerName(game?.lovelace_player, "Jogador 2");

    if (sameId(winnerId, turingId)) {
        return turingName;
    }

    if (sameId(winnerId, lovelaceId)) {
        return lovelaceName;
    }

    return "Vencedor indefinido";
}

function isFinished(game) {
    return String(game?.status || "").toUpperCase() === "FINISHED";
}

function getPhaseLabel(phase) {
    if (phase === "setup_placement") {
        return "Setup";
    }

    return "Batalha";
}

function formatId(idValue) {
    if (idValue === undefined || idValue === null) {
        return "sem id";
    }

    return `#${idValue}`;
}

function formatGameTitleId(id) {
    if (!id) {
        return "";
    }

    const text = String(id);

    if (text.length <= 16) {
        return text;
    }

    return `${text.slice(0, 8)}...${text.slice(-6)}`;
}

function logWinnerDebug(game) {
    console.table({
        winner_player_id: getWinnerId(game),
        winner_player_id_type: typeof getWinnerId(game),

        turing_player_id: getTuringId(game),
        turing_player_id_type: typeof getTuringId(game),
        turing_name: getPlayerName(game?.turing_player, "Jogador 1"),

        lovelace_player_id: getLovelaceId(game),
        lovelace_player_id_type: typeof getLovelaceId(game),
        lovelace_name: getPlayerName(game?.lovelace_player, "Jogador 2"),

        winner_name_resolvido_pelo_front: getWinnerName(game),
    });
}

function InfoPill({ label, value, subValue, accent }) {
    return (
        <div style={styles.infoPill}>
            <span style={styles.infoLabel}>{label}</span>

            <span style={{ ...styles.infoValue, ...(accent ? styles.accentValue : {}) }}>
                {value}
            </span>

            {subValue && (
                <span style={styles.infoSubValue}>
                    {subValue}
                </span>
            )}
        </div>
    );
}

const styles = {
    page: {
        padding: "18px 16px 40px",
        maxWidth: "1180px",
        margin: "0 auto",
        color: "var(--wg-text)",
        transition: "color 0.25s ease",
    },

    title: {
        textAlign: "center",
        margin: "14px 0 6px",
        fontSize: "clamp(1.7rem, 4vw, 2.7rem)",
        lineHeight: 1.1,
        color: "var(--wg-title)",
        wordBreak: "break-word",
        transition: "color 0.25s ease",
    },

    gameId: {
        color: "var(--wg-muted)",
        fontSize: "0.75em",
        fontWeight: 800,
        transition: "color 0.25s ease",
    },

    backWrapper: {
        textAlign: "center",
        marginBottom: "14px",
    },

    backLink: {
        textDecoration: "none",
        fontWeight: "bold",
        color: "var(--wg-link)",
        fontSize: "1rem",
        transition: "color 0.25s ease",
    },

    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },

    compactPanel: {
        width: "100%",
        maxWidth: "760px",
        background: "var(--wg-panel-bg)",
        border: "1px solid var(--wg-panel-border)",
        borderRadius: "14px",
        padding: "10px",
        boxShadow: "var(--wg-panel-shadow)",
        boxSizing: "border-box",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
    },

    infoRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
        gap: "8px",
        width: "100%",
    },

    infoPill: {
        background: "var(--wg-pill-bg)",
        border: "1px solid var(--wg-pill-border)",
        borderRadius: "10px",
        padding: "8px 10px",
        minHeight: "48px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        transition: "background 0.25s ease, border-color 0.25s ease",
    },

    infoLabel: {
        color: "var(--wg-label)",
        fontSize: "0.68rem",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: "3px",
        transition: "color 0.25s ease",
    },

    infoValue: {
        color: "var(--wg-value)",
        fontSize: "0.95rem",
        fontWeight: 900,
        lineHeight: 1.1,
        overflowWrap: "anywhere",
        transition: "color 0.25s ease",
    },

    accentValue: {
        color: "var(--wg-accent)",
    },

    infoSubValue: {
        marginTop: "2px",
        color: "var(--wg-subvalue)",
        fontSize: "0.76rem",
        fontWeight: 800,
        overflowWrap: "anywhere",
        transition: "color 0.25s ease",
    },

    winnerCompact: {
        marginTop: "8px",
        padding: "9px 12px",
        borderRadius: "10px",
        background: "var(--wg-winner-bg)",
        border: "1px solid var(--wg-winner-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap",
        textAlign: "center",
        transition: "background 0.25s ease, border-color 0.25s ease",
    },

    winnerLabel: {
        color: "var(--wg-winner-label)",
        fontSize: "0.75rem",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        transition: "color 0.25s ease",
    },

    winnerName: {
        color: "var(--wg-winner-name)",
        fontSize: "1.1rem",
        fontWeight: 950,
        overflowWrap: "anywhere",
        transition: "color 0.25s ease",
    },

    debugDetails: {
        marginTop: "6px",
        color: "var(--wg-muted)",
        fontSize: "0.78rem",
        transition: "color 0.25s ease",
    },

    debugSummary: {
        cursor: "pointer",
        fontWeight: 800,
        color: "var(--wg-muted)",
        outline: "none",
        transition: "color 0.25s ease",
    },

    debugGrid: {
        marginTop: "6px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
        gap: "6px",
    },

    debugItem: {
        background: "var(--wg-debug-bg)",
        border: "1px solid var(--wg-debug-border)",
        borderRadius: "8px",
        padding: "6px 8px",
        overflowWrap: "anywhere",
        color: "var(--wg-debug-text)",
        transition: "background 0.25s ease, border-color 0.25s ease, color 0.25s ease",
    },

    boardOuter: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
    },
};

export function WatchGamePage() {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const loggedFinishedGameRef = useRef(false);

    async function fetchGame() {
        setError(false);

        try {
            const game = await api.get(`/games/${id}`);
            setData(game);

            if (isFinished(game) && !loggedFinishedGameRef.current) {
                loggedFinishedGameRef.current = true;
                logWinnerDebug(game);
            }
        } catch (err) {
            console.error("Erro ao carregar partida:", err);

            if (!data) {
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!id) return;

        loggedFinishedGameRef.current = false;

        fetchGame();

        const intervalId = setInterval(() => {
            fetchGame();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [id]);

    const turingName = getPlayerName(data?.turing_player, "Jogador 1");
    const lovelaceName = getPlayerName(data?.lovelace_player, "Jogador 2");

    const turingId = getTuringId(data);
    const lovelaceId = getLovelaceId(data);
    const winnerId = getWinnerId(data);
    const winnerName = data ? getWinnerName(data) : "";

    return (
        <div className="watch-game-page-compact watch-game-page-theme" style={styles.page}>
            <style>
                {`
                    .watch-game-page-theme {
                        --wg-title: #0f172a;
                        --wg-text: #0f172a;
                        --wg-muted: #64748b;
                        --wg-link: #7c3aed;

                        --wg-panel-bg: #ffffff;
                        --wg-panel-border: rgba(15, 23, 42, 0.12);
                        --wg-panel-shadow: 0 8px 24px rgba(15, 23, 42, 0.10);

                        --wg-pill-bg: #f8fafc;
                        --wg-pill-border: rgba(15, 23, 42, 0.10);
                        --wg-label: #64748b;
                        --wg-value: #0f172a;
                        --wg-subvalue: #64748b;
                        --wg-accent: #0891b2;

                        --wg-winner-bg: linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(34, 197, 94, 0.14));
                        --wg-winner-border: rgba(14, 165, 233, 0.35);
                        --wg-winner-label: #475569;
                        --wg-winner-name: #0f172a;

                        --wg-debug-bg: rgba(15, 23, 42, 0.04);
                        --wg-debug-border: rgba(15, 23, 42, 0.08);
                        --wg-debug-text: #334155;
                    }

                    .dark-mode .watch-game-page-theme {
                        --wg-title: #f5f6fa;
                        --wg-text: #f5f6fa;
                        --wg-muted: #a4b0be;
                        --wg-link: #a855f7;

                        --wg-panel-bg: #1e2a32;
                        --wg-panel-border: rgba(255, 255, 255, 0.12);
                        --wg-panel-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);

                        --wg-pill-bg: rgba(15, 23, 30, 0.72);
                        --wg-pill-border: rgba(255, 255, 255, 0.08);
                        --wg-label: #a4b0be;
                        --wg-value: #ffffff;
                        --wg-subvalue: #6c7a89;
                        --wg-accent: #00cec9;

                        --wg-winner-bg: linear-gradient(135deg, rgba(0, 206, 201, 0.18), rgba(142, 68, 173, 0.18));
                        --wg-winner-border: rgba(0, 206, 201, 0.32);
                        --wg-winner-label: #a4b0be;
                        --wg-winner-name: #ffffff;

                        --wg-debug-bg: rgba(0, 0, 0, 0.18);
                        --wg-debug-border: rgba(255, 255, 255, 0.04);
                        --wg-debug-text: #dfe6e9;
                    }

                    .watch-game-page-compact .watch-game-board-large .board-container {
                        padding: 18px;
                        border-radius: 16px;
                        transition: background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                    }

                    .watch-game-page-compact .watch-game-board-large .board-grid {
                        grid-template-columns: repeat(5, 92px);
                        gap: 10px;
                    }

                    .watch-game-page-compact .watch-game-board-large .board-cell {
                        width: 92px;
                        height: 92px;
                        border-radius: 10px;
                    }

                    .watch-game-page-compact .watch-game-board-large .level-text {
                        font-size: 13px;
                        font-weight: 900;
                    }

                    .watch-game-page-compact .watch-game-board-large .professor-badge {
                        font-size: 10px;
                        padding: 3px 6px;
                        margin-top: 6px;
                    }

                    @media (max-width: 900px) {
                        .watch-game-page-compact .watch-game-board-large .board-grid {
                            grid-template-columns: repeat(5, 78px);
                            gap: 8px;
                        }

                        .watch-game-page-compact .watch-game-board-large .board-cell {
                            width: 78px;
                            height: 78px;
                        }
                    }

                    @media (max-width: 560px) {
                        .watch-game-page-compact .watch-game-board-large .board-container {
                            padding: 10px;
                        }

                        .watch-game-page-compact .watch-game-board-large .board-grid {
                            grid-template-columns: repeat(5, 58px);
                            gap: 6px;
                        }

                        .watch-game-page-compact .watch-game-board-large .board-cell {
                            width: 58px;
                            height: 58px;
                        }

                        .watch-game-page-compact .watch-game-board-large .level-text {
                            font-size: 9px;
                        }

                        .watch-game-page-compact .watch-game-board-large .professor-badge {
                            font-size: 7px;
                            padding: 1px 3px;
                        }
                    }
                `}
            </style>

            <h1 style={styles.title}>
                Assistindo Jogo{" "}
                <span style={styles.gameId}>
                    #{formatGameTitleId(id)}
                </span>
            </h1>

            <div style={styles.backWrapper}>
                <Link to="/watch" style={styles.backLink}>
                    &lt; Voltar para a lista
                </Link>
            </div>

            {loading && !data && (
                <div className="status-container">
                    <span>Iniciando conexão com a arena...</span>
                </div>
            )}

            {error && (
                <div className="status-container">
                    <span className="error-text">
                        Erro ao carregar os dados da partida.
                    </span>
                </div>
            )}

            {data && data.board && (
                <div style={styles.content}>
                    <section style={styles.compactPanel}>
                        <div style={styles.infoRow}>
                            <InfoPill
                                label="Turno"
                                value={data.current_turn_number ?? "-"}
                            />

                            <InfoPill
                                label="Status"
                                value={data.status ?? "DESCONHECIDO"}
                                accent={isFinished(data)}
                            />

                            <InfoPill
                                label="Fase"
                                value={getPhaseLabel(data.current_turn_phase)}
                            />

                            <InfoPill
                                label="Turing"
                                value={turingName}
                                subValue={formatId(turingId)}
                            />

                            <InfoPill
                                label="Lovelace"
                                value={lovelaceName}
                                subValue={formatId(lovelaceId)}
                            />
                        </div>

                        {isFinished(data) && (
                            <div style={styles.winnerCompact}>
                                <span style={styles.winnerLabel}>Vencedor:</span>
                                <span style={styles.winnerName}>{winnerName}</span>
                            </div>
                        )}

                        {isFinished(data) && (
                            <details style={styles.debugDetails}>
                                <summary style={styles.debugSummary}>
                                    Dados técnicos
                                </summary>

                                <div style={styles.debugGrid}>
                                    <div style={styles.debugItem}>
                                        <strong>winner_player_id:</strong>
                                        <br />
                                        {winnerId ?? "sem winner_player_id"}
                                    </div>

                                    <div style={styles.debugItem}>
                                        <strong>turing_player_id:</strong>
                                        <br />
                                        {turingId ?? "sem id"}
                                    </div>

                                    <div style={styles.debugItem}>
                                        <strong>lovelace_player_id:</strong>
                                        <br />
                                        {lovelaceId ?? "sem id"}
                                    </div>
                                </div>
                            </details>
                        )}
                    </section>

                    <div style={styles.boardOuter} className="watch-game-board-large">
                        <div className="board-container">
                            <div className="board-grid">
                                {data.board.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => (
                                        <BoardCell
                                            key={`${rowIndex}-${colIndex}`}
                                            level={cell.level}
                                            professor={cell.professor}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}