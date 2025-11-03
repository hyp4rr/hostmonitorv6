import MonitorLayout from '@/layouts/monitor-layout';
import { AlertTriangle, Bell, CheckCircle2, X, Clock, User, TrendingDown, Activity, Filter } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Alert {
    id: string;
    deviceName: string;
    deviceIp: string;
    timestamp: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    reason?: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    downtime: string;
    category: string;
}

export default function Alerts() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { currentBranch } = usePage<PageProps>().props;
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [acknowledgeNote, setAcknowledgeNote] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    
    // Mock alerts - in production, this would come from your backend
    const [alerts, setAlerts] = useState<Alert[]>(() => [
        {
            id: '1',
            deviceName: 'Backup Server',
            deviceIp: '192.168.1.14',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            acknowledged: false,
            severity: 'critical',
            downtime: '15 minutes',
            category: 'Server',
        },
        {
            id: '2',
            deviceName: 'Database Server',
            deviceIp: '192.168.1.11',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            acknowledged: false,
            severity: 'high',
            downtime: '5 minutes',
            category: 'Server',
        },
        {
            id: '3',
            deviceName: 'Access Switch',
            deviceIp: '192.168.1.23',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            acknowledged: true,
            acknowledgedBy: 'Admin User',
            reason: 'Scheduled maintenance for firmware update',
            severity: 'medium',
            downtime: '2 hours',
            category: 'Network',
        },
        {
            id: '4',
            deviceName: 'WiFi AP Floor 2',
            deviceIp: '192.168.1.31',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            acknowledged: true,
            acknowledgedBy: 'Admin User',
            reason: 'Power outage in the area',
            severity: 'low',
            downtime: '24 hours',
            category: 'Access Point',
        },
        {
            id: '5',
            deviceName: 'Core Router',
            deviceIp: '192.168.1.1',
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            acknowledged: false,
            severity: 'critical',
            downtime: '45 minutes',
            category: 'Network',
        },
    ]);

    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
    const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;
    const highCount = alerts.filter(a => !a.acknowledged && a.severity === 'high').length;

    const filteredAlerts = filterSeverity === 'all' 
        ? alerts 
        : alerts.filter(a => a.severity === filterSeverity);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-900/50', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/30' };
            case 'high': return { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-900/50', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-900/30' };
            case 'medium': return { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/50', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30' };
            case 'low': return { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/50', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/30' };
            default: return { bg: 'bg-slate-50 dark:bg-slate-950/20', border: 'border-slate-200 dark:border-slate-900/50', text: 'text-slate-700 dark:text-slate-400', badge: 'bg-slate-100 dark:bg-slate-900/30' };
        }
    };

    const handleAcknowledge = () => {
        if (!selectedAlert) return;

        setAlerts(alerts.map(alert =>
            alert.id === selectedAlert.id
                ? {
                    ...alert,
                    acknowledged: true,
                    acknowledgedBy: 'Admin User', // In production, use actual user
                    reason: acknowledgeNote.trim() || 'Acknowledged without note',
                }
                : alert
        ));

        setSelectedAlert(null);
        setAcknowledgeNote('');
    };

    return (
        <MonitorLayout title={t('alerts.title')}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('alerts.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('alerts.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {unacknowledgedCount > 0 && (
                            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 shadow-lg">
                                <Bell className="size-5 animate-pulse text-white" />
                                <span className="text-sm font-semibold text-white">
                                    {unacknowledgedCount} {unacknowledgedCount === 1 ? t('alerts.pending') : t('alerts.pending') + 's'}
                                </span>
                            </div>
                        )}
                        <Link 
                            href="/monitor/configuration"
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105"
                        >
                            {t('alerts.viewInConfig')}
                        </Link>
                    </div>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group relative overflow-hidden rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-red-900/50 dark:from-red-950/50 dark:to-rose-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('alerts.critical')}</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{criticalCount}</p>
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('alerts.criticalNote')}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-red-500 to-orange-600 p-3 shadow-lg">
                                <AlertTriangle className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-orange-900/50 dark:from-orange-950/50 dark:to-amber-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('alerts.high')}</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{highCount}</p>
                                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">{t('alerts.highNote')}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-3 shadow-lg">
                                <TrendingDown className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-green-900/50 dark:from-green-950/50 dark:to-emerald-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('alerts.acknowledged')}</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                                    {alerts.filter(a => a.acknowledged).length}
                                </p>
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">{t('alerts.acknowledgedNote')}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg">
                                <CheckCircle2 className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-blue-900/50 dark:from-blue-950/50 dark:to-indigo-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('alerts.total')}</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{alerts.length}</p>
                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{t('alerts.totalNote')}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                                <Activity className="size-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="rounded-2xl border border-slate-200/50 bg-white p-4 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="size-5 text-slate-600 dark:text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-white">{t('alerts.filterBySeverity')}</span>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                                <button
                                    key={severity}
                                    onClick={() => setFilterSeverity(severity)}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                        filterSeverity === severity
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {/* Pending Alerts */}
                    {filteredAlerts.filter(a => !a.acknowledged).length > 0 && (
                        <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                            <div className="border-b border-slate-200/50 bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:border-slate-700/50 dark:from-red-950/30 dark:to-orange-950/30">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-orange-600 p-2 shadow-lg">
                                        <Bell className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {t('alerts.pendingAlerts')}
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {filteredAlerts.filter(a => !a.acknowledged).length} alert{filteredAlerts.filter(a => !a.acknowledged).length !== 1 ? 's' : ''} {t('alerts.requiringAcknowledgment')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {filteredAlerts.filter(a => !a.acknowledged).map((alert) => {
                                        const colors = getSeverityColor(alert.severity);
                                        return (
                                            <div
                                                key={alert.id}
                                                className={`group relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all hover:shadow-lg`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`rounded-xl ${colors.badge} p-3 shadow-md`}>
                                                        <AlertTriangle className={`size-6 ${colors.text}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                                        {alert.deviceName}
                                                                    </h3>
                                                                    <span className={`rounded-full ${colors.badge} px-3 py-0.5 text-xs font-bold uppercase ${colors.text}`}>
                                                                        {alert.severity}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <span className="font-medium">IP:</span> {alert.deviceIp}
                                                                    </p>
                                                                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <span className="font-medium">Category:</span> {alert.category}
                                                                    </p>
                                                                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <span className="font-medium">Downtime:</span> {alert.downtime}
                                                                    </p>
                                                                    <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                                                                        <span className="font-medium">Triggered:</span> {alert.timestamp.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedAlert(alert)}
                                                            className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                                                        >
                                                            {t('alerts.acknowledgeOnly')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Acknowledged Alerts */}
                    {filteredAlerts.filter(a => a.acknowledged).length > 0 && (
                        <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                            <div className="border-b border-slate-200/50 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-slate-700/50 dark:from-green-950/30 dark:to-emerald-950/30">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-2 shadow-lg">
                                        <CheckCircle2 className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {t('alerts.acknowledgedAlerts')}
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {t('alerts.acknowledgedDescription')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="relative space-y-4">
                                    {/* Timeline line */}
                                    <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-200 to-emerald-200 dark:from-green-900 dark:to-emerald-900" />
                                    
                                    {filteredAlerts.filter(a => a.acknowledged).map((alert, idx) => {
                                        const colors = getSeverityColor(alert.severity);
                                        return (
                                            <div key={alert.id} className="relative pl-16">
                                                {/* Timeline dot */}
                                                <div className="absolute left-[22px] top-6 size-4 rounded-full border-2 border-green-500 bg-white dark:border-green-400 dark:bg-slate-800" />
                                                
                                                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                                    {alert.deviceName}
                                                                </h3>
                                                                <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                    ✓ {t('alerts.resolved')}
                                                                </span>
                                                                <span className={`rounded-full ${colors.badge} px-2 py-0.5 text-xs font-medium uppercase ${colors.text}`}>
                                                                    {alert.severity}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                                <div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-500">{t('alerts.ipAddress')}</p>
                                                                    <p className="font-medium text-slate-900 dark:text-white">{alert.deviceIp}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-500">{t('alerts.category')}</p>
                                                                    <p className="font-medium text-slate-900 dark:text-white">{alert.category}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-500">{t('alerts.downtimeDuration')}</p>
                                                                    <p className="font-medium text-slate-900 dark:text-white">{alert.downtime}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-500">{t('alerts.triggered')}</p>
                                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                                        {new Date(alert.timestamp).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {alert.reason && (
                                                                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                                                    <div className="flex items-start gap-2">
                                                                        <User className="mt-0.5 size-4 text-slate-500 dark:text-slate-400" />
                                                                        <div className="flex-1">
                                                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                                {t('alerts.acknowledgeNote')}
                                                                            </p>
                                                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                                                {alert.reason}
                                                                            </p>
                                                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                                                                                {t('alerts.acknowledgedBy')} {alert.acknowledgedBy}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acknowledge Modal */}
                {selectedAlert && (
                    <>
                        <div
                            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md"
                            onClick={() => {
                                setSelectedAlert(null);
                                setAcknowledgeNote('');
                            }}
                        />
                        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-slate-900">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg">
                                            <CheckCircle2 className="size-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {t('alerts.acknowledgeOnly')}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedAlert(null);
                                            setAcknowledgeNote('');
                                        }}
                                        className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Info Banner */}
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            {t('alerts.acknowledgeInfo')}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                            {selectedAlert.deviceName}
                                        </h4>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">IP:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {selectedAlert.deviceIp}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Severity:</span>
                                                <span className="ml-2 font-medium capitalize text-slate-900 dark:text-white">
                                                    {selectedAlert.severity}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Downtime:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {selectedAlert.downtime}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Category:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {selectedAlert.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                            {t('alerts.acknowledgeNote')}
                                        </label>
                                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                            Optional note for this acknowledgment
                                        </p>
                                        <textarea
                                            value={acknowledgeNote}
                                            onChange={(e) => setAcknowledgeNote(e.target.value)}
                                            placeholder={t('alerts.acknowledgeNotePlaceholder')}
                                            rows={3}
                                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedAlert(null);
                                            setAcknowledgeNote('');
                                        }}
                                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {t('alerts.cancel')}
                                    </button>
                                    <button
                                        onClick={handleAcknowledge}
                                        className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                                    >
                                        {t('alerts.acknowledgeOnly')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MonitorLayout>
    );
}
