import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CustomColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
}

export type ColorPreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'custom';

interface Settings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    customColors?: CustomColors;
    useCustomColors: boolean;
    colorPreset: ColorPreset;
}

// Helper to get current theme (light or dark)
const getCurrentTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    const root = document.documentElement;
    if (root.classList.contains('dark')) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const colorPresets: Record<ColorPreset, CustomColors> = {
    default: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        cardBackground: '#ffffff',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
    ocean: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#3b82f6',
        background: '#f0f9ff',
        cardBackground: '#ffffff',
        text: '#0c4a6e',
        textSecondary: '#075985',
        border: '#bae6fd',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
    forest: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#f0fdf4',
        cardBackground: '#ffffff',
        text: '#064e3b',
        textSecondary: '#047857',
        border: '#a7f3d0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
    sunset: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        background: '#fff7ed',
        cardBackground: '#ffffff',
        text: '#7c2d12',
        textSecondary: '#9a3412',
        border: '#fed7aa',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
    midnight: {
        primary: '#818cf8',
        secondary: '#a78bfa',
        accent: '#c4b5fd',
        background: '#0f172a',
        cardBackground: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    custom: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        cardBackground: '#ffffff',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
};

// Dark mode variants for presets
const darkColorPresets: Record<ColorPreset, CustomColors> = {
    default: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        accent: '#22d3ee',
        background: '#0f172a',
        cardBackground: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    ocean: {
        primary: '#38bdf8',
        secondary: '#22d3ee',
        accent: '#60a5fa',
        background: '#0c4a6e',
        cardBackground: '#075985',
        text: '#e0f2fe',
        textSecondary: '#bae6fd',
        border: '#0284c7',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    forest: {
        primary: '#34d399',
        secondary: '#10b981',
        accent: '#6ee7b7',
        background: '#064e3b',
        cardBackground: '#047857',
        text: '#d1fae5',
        textSecondary: '#a7f3d0',
        border: '#059669',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    sunset: {
        primary: '#fb923c',
        secondary: '#f97316',
        accent: '#fdba74',
        background: '#7c2d12',
        cardBackground: '#9a3412',
        text: '#fff7ed',
        textSecondary: '#fed7aa',
        border: '#ea580c',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    midnight: {
        primary: '#818cf8',
        secondary: '#a78bfa',
        accent: '#c4b5fd',
        background: '#0f172a',
        cardBackground: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    custom: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        accent: '#22d3ee',
        background: '#0f172a',
        cardBackground: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
};

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    resetSettings: () => void;
    colorPresets: typeof colorPresets;
    darkColorPresets: typeof darkColorPresets;
}

const defaultSettings: Settings = {
    theme: 'system',
    language: 'English',
    timezone: 'Asia/Kuala_Lumpur (GMT+8)',
    customColors: colorPresets.default,
    useCustomColors: false,
    colorPreset: 'default',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => {
        // Load settings from localStorage on initial mount
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('hostmonitor_settings');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Ensure customColors is always defined and merge with defaults
                    const mergedColors = parsed.customColors 
                        ? { ...defaultSettings.customColors, ...parsed.customColors }
                        : defaultSettings.customColors;
                    return { 
                        ...defaultSettings, 
                        ...parsed,
                        customColors: mergedColors,
                        useCustomColors: parsed.useCustomColors ?? false,
                        colorPreset: parsed.colorPreset || 'default',
                    };
                } catch (e) {
                    console.error('Failed to parse settings:', e);
                    return defaultSettings;
                }
            }
        }
        return defaultSettings;
    });

    // Apply theme and custom colors whenever they change
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

    // Apply custom colors with theme awareness
    useEffect(() => {
        const root = document.documentElement;
        
        if (settings.useCustomColors && settings.customColors) {
            // Determine if we're in dark mode
            const isDark = settings.theme === 'dark' || 
                          (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
                          root.classList.contains('dark');
            
            // If using a preset (not custom), use dark variant when in dark mode
            let colors = settings.customColors;
            if (settings.colorPreset !== 'custom' && isDark && darkColorPresets[settings.colorPreset]) {
                // Use dark variant for presets in dark mode
                colors = darkColorPresets[settings.colorPreset];
            } else if (settings.colorPreset !== 'custom' && !isDark) {
                // Use light variant for presets in light mode
                colors = colorPresets[settings.colorPreset];
            }
            
            root.style.setProperty('--custom-primary', colors.primary);
            root.style.setProperty('--custom-secondary', colors.secondary);
            root.style.setProperty('--custom-accent', colors.accent);
            root.style.setProperty('--custom-background', colors.background);
            root.style.setProperty('--custom-card-bg', colors.cardBackground);
            root.style.setProperty('--custom-text', colors.text);
            root.style.setProperty('--custom-text-secondary', colors.textSecondary);
            root.style.setProperty('--custom-border', colors.border);
            root.style.setProperty('--custom-success', colors.success);
            root.style.setProperty('--custom-warning', colors.warning);
            root.style.setProperty('--custom-error', colors.error);
            root.classList.add('custom-colors-enabled');
        } else {
            root.style.removeProperty('--custom-primary');
            root.style.removeProperty('--custom-secondary');
            root.style.removeProperty('--custom-accent');
            root.style.removeProperty('--custom-background');
            root.style.removeProperty('--custom-card-bg');
            root.style.removeProperty('--custom-text');
            root.style.removeProperty('--custom-text-secondary');
            root.style.removeProperty('--custom-border');
            root.style.removeProperty('--custom-success');
            root.style.removeProperty('--custom-warning');
            root.style.removeProperty('--custom-error');
            root.classList.remove('custom-colors-enabled');
        }
    }, [settings.useCustomColors, settings.customColors, settings.theme, settings.colorPreset]);

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
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, colorPresets, darkColorPresets }}>
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
