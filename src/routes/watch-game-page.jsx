import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export function WatchGamePage() {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);


    /**
     * Busca um estado aleatório do jogo
     */
    async function fetchGame() {
        setError(false);
        setLoading(true);
        try {
            const response = await fetch(
                "https://pi5-api-production.up.railway.app/api/v1/games/mock-state",                {
                method: "POST",
                },
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar estado do jogo");
            }

            const game = await response.json();
            setData(game);
        } catch (err) {
            setError(err);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!id) return;
        fetchGame();
    }, [id]);

    return (
        <div>
            <h1>Assistindo Jogo #{id}</h1>
            <Link to="/watch">&lt; Voltar</Link>
            <p>
                {error && <spam>Erro ao carregar o jogo.</spam>}
                {loading && <spam>Carregando...</spam>}
                {data && <spam>EStado do jogo: <pre>{JSON.stringify(data, null, 2)}</pre></spam>}
            </p>
        </div>
    )
 }