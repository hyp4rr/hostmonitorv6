import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Load saved theme from localStorage on initialization
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        return savedTheme || 'system';
    });
    const [mounted, setMounted] = useState(false);
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Compute resolved theme
    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    // Set mounted flag
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update document class and save to localStorage when theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove all theme classes
        root.classList.remove('light', 'dark');
        
        // Apply the resolved theme
        root.classList.add(resolvedTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme, resolvedTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
