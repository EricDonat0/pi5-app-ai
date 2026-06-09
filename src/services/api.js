const BASE_URL = import.meta.env.VITE_API_BASE_URL;
let currentToken = import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_API_TOKEN_PALERMABOT;

const getHeaders = () => ({
    "accept": "application/json",
    "Content-Type": "application/json",
    ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {})
});

async function readResponseBody(response) {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (_err) {
        return text;
    }
}

function createApiError(response, data) {
    const error = new Error(`Erro na requisicao: ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.detail = data?.detail ?? data;
    return error;
}

async function request(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getHeaders(),
            ...(options.headers || {})
        }
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
        throw createApiError(response, data);
    }

    return data;
}

export const api = {
    setToken: (newToken) => {
        currentToken = newToken;
    },

    get: async (endpoint) => {
        return request(endpoint, {
            method: "GET"
        });
    },

    post: async (endpoint, payload) => {
        return request(endpoint, {
            method: "POST",
            body: payload === undefined ? undefined : JSON.stringify(payload)
        });
    }
};