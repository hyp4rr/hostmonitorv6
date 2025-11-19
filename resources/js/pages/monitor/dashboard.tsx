import MonitorLayout from '@/layouts/monitor-layout';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Server,
    Wifi,
    MapPin,
    Globe,
} from 'lucide-react';
import { getDeviceCategoryIcon } from '@/utils/device-icons';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import type { CurrentBranch } from '@/types/branch';

interface DeviceType {
    type: string;
    count: number;
    percentage: number;
    color: string;
}

interface LocationStat {
    location: string;
    devices: number;
    online: number;
    offline: number;
}

interface RecentAlert {
    id: number;
    device_name: string;
    title: string;
    message: string;
    severity: 'critical' | 'warning' | 'info' | 'error';
    status: 'active' | 'acknowledged' | 'dismissed';
    acknowledged: boolean;
    resolved: boolean;
    created_at: string;
    created_at_human: string;
}

interface RecentActivity {
    id: number;
    user: string;
    action: string; // created, updated, deleted
    entity_type: string; // device, location, brand, model
    entity_id: number | null;
    details: {
        device_name?: string;
        location_name?: string;
        brand_name?: string;
        model_name?: string;
        changes?: Record<string, any>;
    } | null;
    created_at: string;
    time_ago: string;
}

interface SystemStats {
    totalDevices: number;
    onlineDevices: number;
    warningDevices: number;
    offlineDevices: number;
}

interface DashboardProps extends PageProps {
    stats: SystemStats;
    deviceTypes: DeviceType[];
    locationStats: LocationStat[];
    recentAlerts: RecentAlert[];
    recentActivity: RecentActivity[];
    lastUpdate: string;
    error?: string;
}

export default function Dashboard() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { currentBranch, stats, deviceTypes, locationStats, recentAlerts, recentActivity, lastUpdate, error } = usePage<DashboardProps>().props;

    const lastUpdateDate = new Date(lastUpdate);

    const statCards = [
        {
            name: t('dashboard.totalDevices'),
            value: stats.totalDevices,
            icon: Server,
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
        },
        {
            name: t('dashboard.online'),
            value: stats.onlineDevices,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-green-600',
            bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50',
        },
        {
            name: t('dashboard.offline'),
            value: stats.offlineDevices,
            icon: Wifi,
            gradient: 'from-rose-500 to-red-600',
            bgGradient: 'from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-950/50',
        },
        {
            name: t('dashboard.warning'),
            value: stats.warningDevices,
            icon: AlertTriangle,
            gradient: 'from-yellow-500 to-amber-500',
            bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50',
        },
    ];

    return (
        <MonitorLayout title={t('dashboard.title')}>
            <div className="space-y-6">
                {/* Show error if present */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Header with last update */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('dashboard.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Clock className="size-4" />
                        <span>{lastUpdateDate.toLocaleTimeString()}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.name}
                                className={`group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br ${stat.bgGradient} p-6 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl dark:border-slate-700/50`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {stat.name}
                                        </p>
                                        <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                                        <Icon className="size-6 text-white" />
                                    </div>
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-5`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Device Type Distribution */}
                <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
                            <Server className="size-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('dashboard.deviceTypes')}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Distribution breakdown
                            </p>
                        </div>
                    </div>

                    {deviceTypes.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {deviceTypes.map((device, idx) => (
                                <div 
                                    key={idx} 
                                    className="group relative overflow-hidden rounded-xl border border-slate-200/50 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-900"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${device.color.replace('bg-', 'from-')}/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
                                    <div className="relative">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                {device.count}
                                            </span>
                                            <div className={`rounded-lg ${device.color} p-2`}>
                                                {(() => {
                                                    const Icon = getDeviceCategoryIcon(device.type);
                                                    return <Icon className="size-4 text-white" />;
                                                })()}
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {device.type}
                                        </h3>
                                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>of total</span>
                                            <span className="font-bold">{device.percentage}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div 
                                                className={`h-full rounded-full ${device.color} transition-all duration-500`}
                                                style={{ width: `${device.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            No device data available
                        </div>
                    )}
                </div>

                {/* Location Status Overview */}
                <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 shadow-lg">
                            <MapPin className="size-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('dashboard.locationStatus')}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Devices by location • Click to view on map
                            </p>
                        </div>
                    </div>

                    {locationStats.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {locationStats.map((location, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        router.visit('/monitor/maps', {
                                            data: {
                                                location: location.location,
                                                focusLocation: true,
                                            }
                                        });
                                    }}
                                    className="group relative overflow-hidden rounded-xl border border-slate-200/50 bg-white p-4 text-left transition-all hover:scale-105 hover:shadow-lg hover:border-blue-300 dark:border-slate-700/50 dark:bg-slate-900 dark:hover:border-blue-600 cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="relative">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Globe className="size-4 text-slate-500 group-hover:text-blue-600 transition-colors dark:text-slate-400 dark:group-hover:text-blue-400" />
                                                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors dark:text-white dark:group-hover:text-blue-300">
                                                    {location.location}
                                                </h3>
                                            </div>
                                            <MapPin className="size-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">Total Devices</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{location.devices}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="size-3" />
                                                    Online
                                                </span>
                                                <span className="font-bold text-green-600 dark:text-green-400">{location.online}</span>
                                            </div>
                                            {location.offline > 0 && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                        <AlertTriangle className="size-3" />
                                                        Offline
                                                    </span>
                                                    <span className="font-bold text-red-600 dark:text-red-400">{location.offline}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Health Bar */}
                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div 
                                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                                style={{ width: `${(location.online / location.devices) * 100}%` }}
                                            />
                                        </div>

                                        {/* Hover indicator */}
                                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            Click to view on map →
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            No location data available
                        </div>
                    )}
                </div>

                {/* Recent Activity and Alerts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Alerts */}
                    <div className="rounded-2xl border border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80">
                        <div className="border-b border-slate-200/50 p-6 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-2">
                                    <AlertTriangle className="size-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {t('dashboard.recentAlerts')}
                                </h2>
                            </div>
                        </div>
                        <div className="max-h-[400px] divide-y divide-slate-200/50 overflow-y-auto dark:divide-slate-700/50">
                            {recentAlerts.length > 0 ? (
                                recentAlerts.map((alert) => (
                                    <div key={alert.id} className="p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-2 rounded-full ${
                                                        alert.severity === 'critical' ? 'bg-red-500' :
                                                        alert.severity === 'warning' ? 'bg-amber-500' : 
                                                        alert.severity === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                                                    }`} />
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {alert.device_name}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                    {alert.message}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                                                    {alert.created_at_human}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    alert.status === 'active'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : alert.status === 'acknowledged'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                    {alert.status}
                                                </span>
                                                {alert.resolved && (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Resolved
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No recent alerts
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-2xl border border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80">
                        <div className="border-b border-slate-200/50 p-6 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
                                    <Activity className="size-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {t('dashboard.recentActivity')}
                                </h2>
                            </div>
                        </div>
                        <div className="max-h-[400px] divide-y divide-slate-200/50 overflow-y-auto dark:divide-slate-700/50">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => {
                                    const getActionColor = (action: string) => {
                                        switch (action) {
                                            case 'created': return 'bg-green-500';
                                            case 'updated': return 'bg-blue-500';
                                            case 'deleted': return 'bg-red-500';
                                            default: return 'bg-slate-500';
                                        }
                                    };

                                    const getActionText = (action: string, entityType: string, details: any) => {
                                        const entityName = details?.device_name || details?.location_name || details?.brand_name || details?.model_name || 'Unknown';
                                        const actionVerb = action === 'created' ? 'added' : action === 'updated' ? 'updated' : 'removed';
                                        return `${entityName} ${actionVerb}`;
                                    };

                                    const getChangesText = (details: any) => {
                                        if (!details?.changes) return null;
                                        const changes = details.changes;
                                        const changedFields = Object.keys(changes);
                                        
                                        if (changedFields.length === 0) return null;
                                        
                                        // Format field names nicely
                                        const formatFieldName = (field: string) => {
                                            return field.split('_').map(word => 
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ');
                                        };
                                        
                                        if (changedFields.length === 1) {
                                            return `Changed ${formatFieldName(changedFields[0])}`;
                                        } else if (changedFields.length === 2) {
                                            return `Changed ${formatFieldName(changedFields[0])} and ${formatFieldName(changedFields[1])}`;
                                        } else {
                                            return `Changed ${changedFields.length} fields`;
                                        }
                                    };

                                    return (
                                        <div key={activity.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <div className={`size-2 rounded-full ${getActionColor(activity.action)}`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {getActionText(activity.action, activity.entity_type, activity.details)}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {activity.entity_type.charAt(0).toUpperCase() + activity.entity_type.slice(1)} • {activity.user}
                                                    {getChangesText(activity.details) && (
                                                        <span className="ml-1">• {getChangesText(activity.details)}</span>
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {activity.time_ago}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </MonitorLayout>
    );
}