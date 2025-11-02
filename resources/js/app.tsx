import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from '@/contexts/settings-context';
import { I18nProvider } from '@/contexts/i18n-context';

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
            <SettingsProvider>
                <I18nProvider>
                    <App {...props} />
                </I18nProvider>
            </SettingsProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});