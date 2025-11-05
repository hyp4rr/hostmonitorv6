import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, Languages } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import { useTranslation } from 'react-i18next';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { t, i18n } = useTranslation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Theme Selector */}
            <div className="px-2 py-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    {t('settings.theme')}
                </div>
                <ThemeSelector />
            </div>
            <DropdownMenuSeparator />
            
            {/* Language Selector */}
            <div className="px-2 py-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-2">
                    <Languages className="h-3 w-3" />
                    {t('settings.language')}
                </div>
                <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    <option value="en">🇬🇧 English</option>
                    <option value="ms">🇲🇾 Bahasa Melayu</option>
                    <option value="zh">🇨🇳 中文</option>
                </select>
            </div>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={edit()}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('settings.title')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    {t('settings.sign_out')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}
