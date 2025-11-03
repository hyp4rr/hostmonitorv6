import MonitorLayout from '@/layouts/monitor-layout';
import {
    Globe,
    Moon,
    Save,
    Sun,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Settings() {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { t } = useTranslation();
    const { currentBranch } = usePage<PageProps>().props;
    const [localTheme, setLocalTheme] = useState(settings.theme);
    const [localLanguage, setLocalLanguage] = useState(settings.language);
    const [localTimezone, setLocalTimezone] = useState(settings.timezone);
    const [saved, setSaved] = useState(false);

    // Update local state when settings change
    useEffect(() => {
        setLocalTheme(settings.theme);
        setLocalLanguage(settings.language);
        setLocalTimezone(settings.timezone);
    }, [settings]);

    const handleSave = () => {
        updateSettings({
            theme: localTheme,
            language: localLanguage,
            timezone: localTimezone,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        resetSettings();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <MonitorLayout title={t('settings.title')}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('settings.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('settings.subtitle')}
                        </p>
                    </div>
                    {saved && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="size-5" />
                            <span className="text-sm font-semibold">{t('settings.saved')}</span>
                        </div>
                    )}
                </div>

                {/* General Settings */}
                <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <div className="border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-slate-700/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                                <Globe className="size-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('settings.general')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Basic system preferences and appearance
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 p-6">
                        {/* Theme Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                {t('settings.theme')}
                            </label>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Choose your preferred color scheme for the dashboard
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-3">
                                {[
                                    { value: 'light', icon: Sun, label: t('settings.light'), desc: 'Bright theme' },
                                    { value: 'dark', icon: Moon, label: t('settings.dark'), desc: 'Dark theme' },
                                    { value: 'system', icon: Globe, label: t('settings.system'), desc: 'Match OS' },
                                ].map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setLocalTheme(option.value as typeof localTheme)}
                                            className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-105 ${
                                                localTheme === option.value
                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg dark:from-blue-950/30 dark:to-indigo-950/30'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`rounded-lg p-2 ${localTheme === option.value ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                    <Icon className={`size-5 ${localTheme === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                                                </div>
                                                <span className={`text-sm font-semibold ${localTheme === option.value ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {option.label}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {option.desc}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                {t('settings.language')}
                            </label>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Select your preferred language
                            </p>
                            <select 
                                value={localLanguage}
                                onChange={(e) => setLocalLanguage(e.target.value)}
                                className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                            >
                                <option>English</option>
                                <option>Bahasa Melayu</option>
                                <option>中文</option>
                            </select>
                        </div>

                        {/* Timezone */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                {t('settings.timezone')}
                            </label>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Set your local timezone for accurate timestamps
                            </p>
                            <select 
                                value={localTimezone}
                                onChange={(e) => setLocalTimezone(e.target.value)}
                                className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                            >
                                <option>Asia/Kuala_Lumpur (GMT+8)</option>
                                <option>Asia/Singapore (GMT+8)</option>
                                <option>Asia/Jakarta (GMT+7)</option>
                                <option>Asia/Bangkok (GMT+7)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        {t('settings.reset')}
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
                    >
                        <Save className="size-5" />
                        {t('settings.save')}
                    </button>
                </div>
            </div>
        </MonitorLayout>
    );
}
