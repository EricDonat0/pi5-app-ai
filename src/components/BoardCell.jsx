export function BoardCell({ level, professor }) {
    const isTeam1 = professor === "CLARO" || professor === "REY";
    const teamClass = isTeam1 ? "team-1" : "team-2";

    // Função para traduzir o número puro para o tema da faculdade
    function formatarAno(lvl) {
        if (lvl === 0) return "1º Ano";
        if (lvl === 1) return "2º Ano";
        if (lvl === 2) return "3º Ano";
        if (lvl === 3) return "4º Ano";
        if (lvl >= 4) return "GRADUADO";
        return lvl;
    }

    const levelText = formatarAno(level);
    const isGraduated = level >= 4;

    return (
        <div className={`board-cell level-${level}`}>
            {levelText && (
                <span
                    className="level-text"
                    style={isGraduated ? {
                        fontWeight: '900',
                        color: '#ffd700', // Dourado para destacar a formatura
                        fontSize: '0.75rem',
                        letterSpacing: '1px'
                    } : {}}
                >
                    {levelText}
                </span>
            )}

            {professor && (
                <div className={`professor-badge ${teamClass}`}>
                    {professor}
                </div>
            )}
        </div>
    );
}