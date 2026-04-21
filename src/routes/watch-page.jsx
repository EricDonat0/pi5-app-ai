import { Link } from "react-router";

export function WatchListPage() {
    return (
        <div>
            <h1>Assistir</h1>
            <ul>
                <li>
                    <Link to="/watch/1">Assistir Jogo 1</Link>
                </li>
            </ul>
        </div>
    );
}