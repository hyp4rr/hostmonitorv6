import MonitorLayout from '@/layouts/monitor-layout';
import { useSettings, type ColorPreset } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { Sun, Moon, Monitor, Globe, Save, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Settings() {
    const { settings, updateSettings, colorPresets, darkColorPresets } = useSettings();
    const { t } = useTranslation();
    
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [activeColorSection, setActiveColorSection] = useState<'main' | 'status'>('main');

    const [isDark, setIsDark] = useState(false);
    
    // Update isDark when theme changes
    useEffect(() => {
        const updateIsDark = () => {
            if (settings.theme === 'dark') {
                setIsDark(true);
            } else if (settings.theme === 'light') {
                setIsDark(false);
            } else {
                // System theme
                setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
            }
        };
        
        updateIsDark();
        
        if (settings.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateIsDark);
            return () => mediaQuery.removeEventListener('change', updateIsDark);
        }
    }, [settings.theme]);
    
    const getPresetColors = (preset: ColorPreset) => {
        return isDark && darkColorPresets[preset] ? darkColorPresets[preset] : colorPresets[preset];
    };
    
    // Update colors when theme changes (if using a preset)
    useEffect(() => {
        if (settings.useCustomColors && settings.colorPreset !== 'custom') {
            const colors = getPresetColors(settings.colorPreset);
            // Only update if colors actually changed
            const currentColors = settings.customColors;
            if (!currentColors || 
                currentColors.primary !== colors.primary ||
                currentColors.background !== colors.background ||
                currentColors.text !== colors.text) {
                updateSettings({
                    customColors: colors,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark, settings.colorPreset, settings.useCustomColors]);

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updateSettings({ theme });
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };

    const handlePresetChange = (preset: ColorPreset) => {
        if (preset !== 'custom') {
            // Use theme-appropriate colors
            const colors = isDark && darkColorPresets[preset] ? darkColorPresets[preset] : colorPresets[preset];
            updateSettings({
                colorPreset: preset,
                customColors: colors,
            });
            setShowSavedMessage(true);
            setTimeout(() => setShowSavedMessage(false), 2000);
        } else {
            updateSettings({ colorPreset: 'custom' });
        }
    };

    const handleColorChange = (key: keyof NonNullable<typeof settings.customColors>, value: string) => {
        updateSettings({
            customColors: {
                ...settings.customColors!,
                [key]: value,
            },
            colorPreset: 'custom', // Switch to custom when manually editing
        });
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };

    const ColorInput = ({ label, colorKey, description }: { label: string; colorKey: keyof NonNullable<typeof settings.customColors>; description?: string }) => (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {description && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({description})</span>}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={settings.customColors?.[colorKey] || '#000000'}
                    onChange={(e) => handleColorChange(colorKey, e.target.value)}
                    className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
                />
                <input
                    type="text"
                    value={settings.customColors?.[colorKey] || '#000000'}
                    onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            handleColorChange(colorKey, e.target.value);
                        }
                    }}
                    placeholder="#000000"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
            </div>
        </div>
    );

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

                {/* Color Customization */}
                <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2">
                                <Palette className="size-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Color Customization</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Personalize the appearance with color presets or custom colors
                                </p>
                            </div>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={settings.useCustomColors || false}
                                onChange={(e) => {
                                    updateSettings({ useCustomColors: e.target.checked });
                                    setShowSavedMessage(true);
                                    setTimeout(() => setShowSavedMessage(false), 2000);
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable</span>
                        </label>
                    </div>

                    {settings.useCustomColors && (
                        <div className="space-y-6">
                            {/* Color Presets */}
                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Color Presets
                                </label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                    {(['default', 'ocean', 'forest', 'sunset', 'midnight', 'custom'] as ColorPreset[]).map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => handlePresetChange(preset)}
                                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                                                settings.colorPreset === preset
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="flex gap-1">
                                                <div 
                                                    className="h-4 w-4 rounded" 
                                                    style={{ backgroundColor: getPresetColors(preset).primary }}
                                                />
                                                <div 
                                                    className="h-4 w-4 rounded" 
                                                    style={{ backgroundColor: getPresetColors(preset).secondary }}
                                                />
                                                <div 
                                                    className="h-4 w-4 rounded" 
                                                    style={{ backgroundColor: getPresetColors(preset).accent }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium capitalize text-slate-700 dark:text-slate-300">
                                                {preset === 'custom' ? 'Custom' : preset}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Sections Tabs */}
                            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setActiveColorSection('main')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        activeColorSection === 'main'
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                                    }`}
                                >
                                    Main Colors
                                </button>
                                <button
                                    onClick={() => setActiveColorSection('status')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        activeColorSection === 'status'
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                                    }`}
                                >
                                    Status Colors
                                </button>
                            </div>

                            {/* Main Colors Section */}
                            {activeColorSection === 'main' && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <ColorInput label="Primary" colorKey="primary" description="Buttons, links" />
                                        <ColorInput label="Secondary" colorKey="secondary" description="Secondary actions" />
                                        <ColorInput label="Accent" colorKey="accent" description="Highlights" />
                                        <ColorInput label="Background" colorKey="background" description="Page background" />
                                        <ColorInput label="Card Background" colorKey="cardBackground" description="Card backgrounds" />
                                        <ColorInput label="Text" colorKey="text" description="Main text" />
                                        <ColorInput label="Text Secondary" colorKey="textSecondary" description="Secondary text" />
                                        <ColorInput label="Border" colorKey="border" description="Borders, dividers" />
                                    </div>
                                </div>
                            )}

                            {/* Status Colors Section */}
                            {activeColorSection === 'status' && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <ColorInput label="Success" colorKey="success" description="Online, success states" />
                                        <ColorInput label="Warning" colorKey="warning" description="Warning states" />
                                        <ColorInput label="Error" colorKey="error" description="Offline, error states" />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                                <button
                                    onClick={() => {
                                        const defaultColors = isDark && darkColorPresets.default ? darkColorPresets.default : colorPresets.default;
                                        updateSettings({
                                            customColors: defaultColors,
                                            colorPreset: 'default',
                                        });
                                        setShowSavedMessage(true);
                                        setTimeout(() => setShowSavedMessage(false), 2000);
                                    }}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                >
                                    <RotateCcw className="size-4" />
                                    Reset to Default
                                </button>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Sparkles className="size-4" />
                                    <span>Changes apply instantly</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MonitorLayout>
    );
}
