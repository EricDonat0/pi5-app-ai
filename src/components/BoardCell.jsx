export function BoardCell({ level, professor }) {
    const isTeam1 = professor === "CLARO" || professor === "REY";
    const teamClass = isTeam1 ? "team-1" : "team-2";

    return (
        <div className={`board-cell level-${level}`}>
            <span className="level-text">Lvl {level}</span>
            {professor && (
                <div className={`professor-badge ${teamClass}`}>
                    {professor}
                </div>
            )}
        </div>
    );
}