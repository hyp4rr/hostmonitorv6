import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
            <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                    theme === 'light'
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-600 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Light Mode"
                aria-label="Light Mode"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                    theme === 'dark'
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-600 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Dark Mode"
                aria-label="Dark Mode"
            >
                <Moon className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                    theme === 'system'
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-600 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="System Theme"
                aria-label="System Theme"
            >
                <Monitor className="h-4 w-4" />
            </button>
        </div>
    );
}
