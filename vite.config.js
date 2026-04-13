import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react"
import path from "path";

const workingDirectory = process.cwd();

export default defineConfig({
    resolve: {
        alias: {
            // Podemos ter mais de um alias
            "@": path.resolve(workingDirectory, "src"),
        }
    },
    plugins: [react()],
    server: {
        port: 5000,
    }
});