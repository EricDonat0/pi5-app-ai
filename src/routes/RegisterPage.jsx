import { PlayerRegisterForm } from '../feature/game/components/player-register-form';

export function RegisterPage() {
    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", textAlign: "center" }}>
            <h1 style={{ color: "#ff4757", fontSize: "2.5rem", margin: "0 0 10px 0" }}>
                Alistamento de IA
            </h1>
            <p className="hero-subtitle" style={{ marginBottom: "40px" }}>
                Registre os dados do seu bot para conectá-lo ao servidor central do torneio.
            </p>

            {/* Usando a mesma classe de container do seu formulário de batalha */}
            <div className="battle-form-container" style={{ textAlign: "left" }}>
                <PlayerRegisterForm />
            </div>
        </div>
    );
}