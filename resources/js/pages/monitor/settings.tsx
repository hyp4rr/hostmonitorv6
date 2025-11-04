import MonitorLayout from '@/layouts/monitor-layout';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { Sun, Moon, Monitor, Globe } from 'lucide-react';

export default function Settings() {
    const { settings, updateSettings } = useSettings();
    const { t, changeLanguage } = useTranslation();

    return (
        <MonitorLayout title={t('settings.title')}>
            <div className="space-y-6">
                <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                    Settings
                </h1>

                {/* Theme Settings */}
                <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Theme</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {(['light', 'dark', 'system'] as const).map((theme) => (
                            <button
                                key={theme}
                                onClick={() => updateSettings({ theme })}
                                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${
                                    settings.theme === theme
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                                }`}
                            >
                                {theme === 'light' && <Sun className="size-6" />}
                                {theme === 'dark' && <Moon className="size-6" />}
                                {theme === 'system' && <Monitor className="size-6" />}
                                <span className="capitalize">{theme}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Settings */}
                <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Language</h2>
                    <select
                        value={settings.language}
                        onChange={(e) => {
                            updateSettings({ language: e.target.value as 'en' | 'ms' });
                            changeLanguage(e.target.value as 'en' | 'ms');
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                        <option value="en">English</option>
                        <option value="ms">Bahasa Melayu</option>
                    </select>
                </div>
            </div>
        </MonitorLayout>
    );
}
