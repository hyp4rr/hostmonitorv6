import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        strictPort: true,
        origin: 'http://192.168.1.128:3000',
        cors: true,
        hmr: {
            host: '192.168.1.128',
            port: 3000,
            protocol: 'ws',
            clientPort: 3000,
        },
    },
});