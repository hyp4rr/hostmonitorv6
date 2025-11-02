import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Settings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    resetSettings: () => void;
}

const defaultSettings: Settings = {
    theme: 'system',
    language: 'English',
    timezone: 'Asia/Kuala_Lumpur (GMT+8)',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => {
        // Load settings from localStorage on initial mount
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('hostmonitor_settings');
            if (saved) {
                try {
                    return { ...defaultSettings, ...JSON.parse(saved) };
                } catch (e) {
                    console.error('Failed to parse settings:', e);
                    return defaultSettings;
                }
            }
        }
        return defaultSettings;
    });

    // Apply theme whenever it changes
    useEffect(() => {
        const applyTheme = () => {
            // Don't apply theme if we're in print mode
            if (sessionStorage.getItem('pre-print-theme')) {
                return;
            }

            const root = document.documentElement;
            
            if (settings.theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.toggle('dark', systemTheme === 'dark');
            } else {
                root.classList.toggle('dark', settings.theme === 'dark');
            }
        };

        applyTheme();

        // Listen for system theme changes if using system theme
        if (settings.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [settings.theme]);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('hostmonitor_settings', JSON.stringify(settings));
        }
    }, [settings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('hostmonitor_settings');
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
