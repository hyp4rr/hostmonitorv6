import MonitorLayout from '@/layouts/monitor-layout';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { Sun, Moon, Monitor, Globe, Save } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
    const { settings, updateSettings } = useSettings();
    const { t } = useTranslation();
    
    const [showSavedMessage, setShowSavedMessage] = useState(false);

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updateSettings({ theme });
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };

    return (
        <MonitorLayout title={t('settings.title')}>
            <div className="space-y-6">
                {/* Success Toast */}
                {showSavedMessage && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
                        <div className="rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
                            <div className="flex items-center gap-2">
                                <Save className="size-5" />
                                <span className="font-medium">Settings saved successfully!</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                        System Settings
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Configure your monitoring system preferences and behavior
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Theme Settings */}
                    <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2">
                                <Sun className="size-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Appearance</h2>
                        </div>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                            Customize the visual appearance of the interface
                        </p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {(['light', 'dark', 'system'] as const).map((theme) => (
                                <button
                                    key={theme}
                                    onClick={() => handleThemeChange(theme)}
                                    className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${
                                        settings.theme === theme
                                            ? 'border-blue-500 bg-blue-50 text-slate-900 dark:bg-blue-950/30 dark:text-white'
                                            : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
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
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                <Globe className="size-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Language</h2>
                        </div>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                            Select your preferred display language
                        </p>
                        <select
                            value={settings.language}
                            onChange={(e) => {
                                updateSettings({ language: e.target.value });
                                setShowSavedMessage(true);
                                setTimeout(() => setShowSavedMessage(false), 2000);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="English">🇬🇧 English</option>
                            <option value="Bahasa Melayu">🇲🇾 Bahasa Melayu</option>
                        </select>
                    </div>
                </div>
            </div>
        </MonitorLayout>
    );
}
