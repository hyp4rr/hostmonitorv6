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
        port: 3000,
        host: '0.0.0.0', // Allow access from network (phone, other devices)
        hmr: {
            host: 'localhost', // HMR still uses localhost for better performance
            port: 3000, // HMR port (should match server port)
        },
    },
});