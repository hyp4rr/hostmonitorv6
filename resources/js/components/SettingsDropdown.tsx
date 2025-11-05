import { Settings, Languages, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ThemeSelector from './ThemeSelector';

interface PageProps {
    auth?: {
        user?: {
            name: string;
            email: string;
        };
    };
    [key: string]: unknown;
}

export default function SettingsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t, i18n } = useTranslation();
    const page = usePage<PageProps>();
    const auth = page.props.auth;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center justify-center h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-105"
                aria-haspopup="true"
                aria-expanded={isOpen}
                title={t('settings.title')}
            >
                <Settings className="h-5 w-5 text-white transition-transform group-hover:rotate-90 duration-300" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-2 z-50 dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {auth?.user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {auth?.user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Settings Content */}
                        <div className="px-4 py-4 space-y-5">
                            {/* Theme Selector */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                        <span className="text-xs">🎨</span>
                                    </div>
                                    {t('settings.theme')}
                                </label>
                                <ThemeSelector />
                            </div>

                            {/* Language Selector */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/30">
                                        <Languages className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    {t('settings.language')}
                                </label>
                                <select
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-slate-600"
                                    value={i18n.language}
                                    onChange={(e) => changeLanguage(e.target.value)}
                                >
                                    <option value="en">🇬🇧 English</option>
                                    <option value="ms">🇲🇾 Bahasa Melayu</option>
                                    <option value="zh">🇨🇳 中文</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-2 py-2 border-t border-slate-100 dark:border-slate-700">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/20 group"
                            >
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{t('settings.sign_out')}</span>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
