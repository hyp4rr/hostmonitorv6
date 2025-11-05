import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from '@/contexts/settings-context';
import { I18nProvider } from '@/contexts/i18n-context';
import { ConfigAuthProvider } from '@/contexts/config-auth-context';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './lib/i18n'; // Initialize i18n

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <SettingsProvider>
                    <I18nProvider>
                        <ConfigAuthProvider>
                            <App {...props} />
                        </ConfigAuthProvider>
                    </I18nProvider>
                </SettingsProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});