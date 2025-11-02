import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bell,
    Building2,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Cog,
    FileText,
    LayoutDashboard,
    MapPin,
    Menu,
    Moon,
    Server,
    Settings,
    Sun,
    X,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useConfigAuth } from '@/contexts/config-auth-context';

interface MonitorLayoutProps {
    children: ReactNode;
    title: string;
}

interface Alert {
    id: string;
    deviceName: string;
    deviceIp: string;
    timestamp: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    reason?: string;
}

interface NavItem {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    current?: boolean;
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/monitor/dashboard', icon: LayoutDashboard },
    { name: 'Devices', href: '/monitor/devices', icon: Server },
    { name: 'Maps', href: '/monitor/maps', icon: MapPin },
    { name: 'Alerts', href: '/monitor/alerts', icon: Bell },
    { name: 'Reports', href: '/monitor/reports', icon: FileText },
    { name: 'Configuration', href: '/monitor/configuration', icon: Cog },
    { name: 'Settings', href: '/monitor/settings', icon: Settings },
];

// Remove BranchProvider import and usage, get data from page props instead
interface PageProps {
    currentBranch?: {
        id: number;
        name: string;
        code: string;
        description: string;
        address: string;
        latitude: number;
        longitude: number;
        is_active: boolean;
        devices: any[];
        deviceCount: number;
        locations: string[];
    };
}

export default function MonitorLayout({ children, title }: MonitorLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showAlertPanel, setShowAlertPanel] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [acknowledgeReason, setAcknowledgeReason] = useState('');
    const [showBranchMenu, setShowBranchMenu] = useState(false);
    
    // Get branch data directly from Inertia page props
    const { props } = usePage<PageProps>();
    const currentBranch = props.currentBranch || {
        id: 1,
        name: 'Default Branch',
        code: 'DEFAULT',
        description: 'No branch configured',
        address: '',
        latitude: 0,
        longitude: 0,
        is_active: true,
        devices: [],
        deviceCount: 0,
        locations: [],
    };
    
    // For now, branches is just an array with current branch
    const branches = [currentBranch];
    
    const handleBranchSwitch = (branchId: number) => {
        console.log('Switching to branch:', branchId);
        // In production, this would navigate to a different branch
    };
    
    // Mock alerts - in production, this would come from your backend
    const [alerts, setAlerts] = useState<Alert[]>(() => [
        {
            id: '1',
            deviceName: 'Backup Server',
            deviceIp: '192.168.1.14',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            acknowledged: false,
        },
        {
            id: '2',
            deviceName: 'Database Server',
            deviceIp: '192.168.1.11',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            acknowledged: false,
        },
    ]);

    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

    const handleAcknowledge = () => {
        if (selectedAlert && acknowledgeReason.trim()) {
            setAlerts(alerts.map(alert => 
                alert.id === selectedAlert.id 
                    ? { ...alert, acknowledged: true, acknowledgedBy: 'Admin', reason: acknowledgeReason }
                    : alert
            ));
            setSelectedAlert(null);
            setAcknowledgeReason('');
        }
    };

    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setDarkMode(isDark);
        };
        checkDarkMode();
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const { isAuthenticated, logout } = useConfigAuth();

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 w-64 transform backdrop-blur-xl bg-white/80 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900/80 lg:hidden ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-16 items-center justify-between border-b border-slate-200/50 px-4 dark:border-slate-700/50">
                        <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">
                            Host Monitor
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                    <nav className="space-y-1 p-4">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:shadow-lg dark:text-slate-300 dark:hover:from-blue-600 dark:hover:to-indigo-600"
                                >
                                    <Icon className="size-5 transition-transform group-hover:scale-110" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Desktop sidebar */}
                <div
                    className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col lg:border-r lg:border-slate-200/50 lg:backdrop-blur-xl lg:bg-white/80 lg:transition-all lg:duration-300 lg:shadow-xl dark:lg:border-slate-700/50 dark:lg:bg-slate-900/80 ${
                        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
                    }`}
                >
                    <div className="flex h-16 items-center justify-between border-b border-slate-200/50 px-4 dark:border-slate-700/50">
                        {!sidebarCollapsed && (
                            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">
                                Host Monitor
                            </h1>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight className="size-5" />
                            ) : (
                                <ChevronLeft className="size-5" />
                            )}
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:shadow-lg dark:text-slate-300 dark:hover:from-blue-600 dark:hover:to-indigo-600"
                                >
                                    <Icon className="size-5 shrink-0 transition-transform group-hover:scale-110" />
                                    {!sidebarCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-slate-200/50 p-4 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-sm font-semibold text-white shadow-lg">
                                <Activity className="size-4 animate-pulse" />
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        System Status
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        All systems operational
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div
                    className={`lg:transition-all lg:duration-300 ${
                        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                    }`}
                >
                    {/* Top bar */}
                    <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-slate-200/50 backdrop-blur-xl bg-white/80 px-4 shadow-lg dark:border-slate-700/50 dark:bg-slate-900/80 sm:gap-x-6 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-slate-700 transition-all hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="size-6" />
                        </button>

                        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                            <div className="flex flex-1 items-center">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-x-4 lg:gap-x-6">
                                {/* Branch Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowBranchMenu(!showBranchMenu)}
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <Building2 className="size-4" />
                                        <span className="hidden sm:inline">{currentBranch.name}</span>
                                        <span className="sm:hidden">{currentBranch.code}</span>
                                        <ChevronDown className="size-4" />
                                    </button>

                                    {showBranchMenu && (
                                        <>
                                            {/* Transparent overlay */}
                                            <div
                                                className="fixed inset-0 z-40 bg-transparent"
                                                onClick={() => setShowBranchMenu(false)}
                                            />
                                            {/* Dropdown menu */}
                                            <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                                                <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:border-slate-700 dark:from-blue-950/30 dark:to-indigo-950/30">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                        Select Branch
                                                    </p>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {branches.map((branch) => (
                                                        <button
                                                            key={branch.id}
                                                            onClick={() => {
                                                                handleBranchSwitch(branch.id);
                                                                setShowBranchMenu(false);
                                                            }}
                                                            className={`w-full p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                                                currentBranch.id === branch.id
                                                                    ? 'bg-blue-50 dark:bg-blue-950/20'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1 rounded-lg p-2 ${
                                                                    currentBranch.id === branch.id
                                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                                        : 'bg-slate-100 dark:bg-slate-700'
                                                                }`}>
                                                                    <Building2 className={`size-4 ${
                                                                        currentBranch.id === branch.id
                                                                            ? 'text-white'
                                                                            : 'text-slate-600 dark:text-slate-400'
                                                                    }`} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className={`text-sm font-bold ${
                                                                            currentBranch.id === branch.id
                                                                                ? 'text-blue-900 dark:text-blue-100'
                                                                                : 'text-slate-900 dark:text-white'
                                                                        }`}>
                                                                            {branch.name}
                                                                        </h4>
                                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                                            currentBranch.id === branch.id
                                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                                        }`}>
                                                                            {branch.code}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                                                                        {branch.description}
                                                                    </p>
                                                                    <div className="mt-2 flex items-center gap-3 text-xs">
                                                                        <span className="text-slate-500 dark:text-slate-500">
                                                                            {branch.locations.length} locations
                                                                        </span>
                                                                        <span className="text-slate-500 dark:text-slate-500">•</span>
                                                                        <span className="text-slate-500 dark:text-slate-500">
                                                                            {branch.deviceCount} devices
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {currentBranch.id === branch.id && (
                                                                    <div className="mt-1">
                                                                        <div className="rounded-full bg-blue-500 p-1">
                                                                            <CheckCircle2 className="size-3 text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="hidden lg:block">
                                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <div className="size-2 animate-pulse rounded-full bg-emerald-500"></div>
                                        <span>Live</span>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleDarkMode}
                                    className="rounded-lg p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? (
                                        <Sun className="size-5" />
                                    ) : (
                                        <Moon className="size-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="py-8">
                        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                    </main>
                </div>
            </div>

            {/* Alert Panel Modal */}
            {showAlertPanel && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm"
                        onClick={() => {
                            setShowAlertPanel(false);
                            setSelectedAlert(null);
                            setAcknowledgeReason('');
                        }}
                    />
                    <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-slate-900">
                        {/* Header */}
                        <div className="sticky top-0 border-b border-slate-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
                                        <AlertTriangle className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Device Alerts
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {unacknowledgedCount} pending
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAlertPanel(false);
                                        setSelectedAlert(null);
                                        setAcknowledgeReason('');
                                    }}
                                    className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Alerts List */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`rounded-xl border p-4 transition-all ${
                                            alert.acknowledged
                                                ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                                                : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                                        {alert.deviceName}
                                                    </h3>
                                                    {alert.acknowledged ? (
                                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            Acknowledged
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                    {alert.deviceIp}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                                                    {alert.timestamp.toLocaleString()}
                                                </p>
                                                {alert.acknowledged && alert.reason && (
                                                    <div className="mt-3 rounded-lg bg-white p-3 dark:bg-slate-900">
                                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                            Reason:
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                            {alert.reason}
                                                        </p>
                                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                                                            By: {alert.acknowledgedBy}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!alert.acknowledged && (
                                            <button
                                                onClick={() => setSelectedAlert(alert)}
                                                className="mt-3 w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Acknowledge Modal */}
            {selectedAlert && (
                <>
                    <div
                        className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm"
                        onClick={() => {
                            setSelectedAlert(null);
                            setAcknowledgeReason('');
                        }}
                    />
                    <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200/50 bg-white p-6 shadow-2xl dark:border-slate-700/50 dark:bg-slate-900">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Acknowledge Alert
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Device: <span className="font-semibold">{selectedAlert.deviceName}</span>
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            IP: {selectedAlert.deviceIp}
                        </p>
                        
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-900 dark:text-white">
                                Reason / Notes <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={acknowledgeReason}
                                onChange={(e) => setAcknowledgeReason(e.target.value)}
                                placeholder="Provide a reason for this downtime..."
                                rows={4}
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedAlert(null);
                                    setAcknowledgeReason('');
                                }}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAcknowledge}
                                disabled={!acknowledgeReason.trim()}
                                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
