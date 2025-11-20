import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            // The 'hot' file is created automatically for HMR - it's already in .gitignore
            // You can safely ignore it in your editor/file explorer
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    server: {
        port: 3000,
        host: '0.0.0.0', // Allow access from network (phone, other devices)
        hmr: {
            host: 'localhost', // HMR still uses localhost for better performance
            port: 3000, // HMR port (should match server port)
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
