import { useState } from "react";

export function App () {
    const [counter, setCounter] = useState(0);

    return (
        <div>
            <h1>Hello, Vite + React!</h1>
            <p>Só para ver se isso funciona mesmo...</p>
            <hr />
            <p>Contador: {counter}</p>
            <button onClick={() => setCounter(counter + 1)}>+1</button>
            <button onClick={() => setCounter(counter - 1)}>-1</button>
        </div>
    );
}