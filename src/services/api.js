const BASE_URL = import.meta.env.VITE_API_BASE_URL;
let currentToken = import.meta.env.VITE_API_TOKEN;

// Função que pega o token atualizado toda vez que for chamada
const getHeaders = () => ({
    "accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${currentToken}`
});

export const api = {
    // Função para trocar de jogador!
    setToken: (newToken) => {
        currentToken = newToken;
    },

    get: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers: getHeaders(), // Usa os cabeçalhos atualizados
        });
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
        return response.json();
    },

    post: async (endpoint, payload) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: getHeaders(), // Usa os cabeçalhos atualizados
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }
};