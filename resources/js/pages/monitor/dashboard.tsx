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
import { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { router } from '@inertiajs/react';

interface SystemStats {
    totalDevices: number;
    onlineDevices: number;
    warningDevices: number;
    offlineDevices: number;
}

export default function Dashboard() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const [stats] = useState<SystemStats>({
        totalDevices: 0,
        onlineDevices: 0,
        warningDevices: 0,
        offlineDevices: 0,
    });

    const [recentAlerts] = useState<any[]>([]);
    const [recentActivity] = useState<any[]>([]);
    const [lastUpdate] = useState(new Date());

    // Sample location data
    const locationStats = [
        { location: 'MC Rack Server A5', devices: 8, online: 8, offline: 0 },
        { location: 'MC Rack Server C2', devices: 6, online: 5, offline: 1 },
        { location: 'MC Blok ABC', devices: 12, online: 11, offline: 1 },
        { location: 'MC FKEE QA.QB', devices: 5, online: 5, offline: 0 },
    ];

    // Sample device type breakdown
    const deviceTypes = [
        { type: 'Switches', count: 15, percentage: 30, color: 'bg-blue-500' },
        { type: 'Servers', count: 12, percentage: 24, color: 'bg-green-500' },
        { type: 'WiFi', count: 10, percentage: 20, color: 'bg-purple-500' },
        { type: 'TAS', count: 8, percentage: 16, color: 'bg-orange-500' },
        { type: 'CCTV', count: 5, percentage: 10, color: 'bg-red-500' },
    ];

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
            gradient: 'from-yellow-500 to-amber-500', // Changed from amber-500/orange-600
            bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50', // Changed
        },
    ];

    return (
        <MonitorLayout title={t('dashboard.title')}>
            <div className="space-y-6">
                {/* Header with last update */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('dashboard.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Clock className="size-4" />
                        <span>{lastUpdate.toLocaleTimeString()}</span>
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
                                        <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
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
                                            <Server className="size-4 text-white" />
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
                        <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
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
                                                        {alert.device_name || alert.title || 'Unknown Device'}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                    {alert.message || 'No message'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                                                    {alert.created_at_human || (alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Unknown time')}
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
                        <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <div
                                            className={`size-2 rounded-full ${
                                                activity.status === 'online' || activity.status === 'up'
                                                    ? 'bg-green-500'
                                                    : activity.status === 'warning'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            }`}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {activity.device_name || 'Unknown Device'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Status: {activity.status || 'unknown'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {activity.time_ago || 'Unknown'}
                                        </span>
                                    </div>
                                ))
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
