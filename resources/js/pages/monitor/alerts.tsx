import MonitorLayout from '@/layouts/monitor-layout';
import { AlertTriangle, CheckCircle2, Clock, Search, Filter, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Alert {
    id: number;
    device_id: number;
    device?: { name: string; ip_address: string };
    type: string;
    severity: 'critical' | 'warning' | 'info' | 'error';
    category: string;
    title: string;
    message: string;
    status: 'active' | 'acknowledged' | 'dismissed';
    acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: string;
    reason?: string;
    resolved: boolean;
    resolved_at?: string;
    triggered_at: string;
    downtime?: string;
}

export default function Alerts() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { currentBranch } = usePage<PageProps>().props;
    
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'error'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'dismissed'>('all');

    useEffect(() => {
        fetchAlerts();
    }, [currentBranch?.id]);

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const url = currentBranch?.id 
                ? `/api/alerts?branch_id=${currentBranch.id}`
                : '/api/alerts';
            
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            });
            
            if (response.ok) {
                const data = await response.json();
                setAlerts(data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            alert.device?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
        
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
            case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
        }
    };

    return (
        <MonitorLayout title={t('alerts.title')}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                        Alert Management
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Monitor and manage system alerts for {currentBranch?.name || 'all branches'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value as any)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                            <option value="error">Error</option>
                        </select>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
                            <p className="text-slate-600 dark:text-slate-400">Loading alerts...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-12 text-center shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                            <Bell className="mx-auto mb-4 size-12 text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Alerts</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                {searchQuery || severityFilter !== 'all' || statusFilter !== 'all'
                                    ? 'No alerts match your filters'
                                    : 'All systems operating normally'}
                            </p>
                        </div>
                    ) : (
                        filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="rounded-xl border border-slate-200/50 bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-800"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {alert.device?.name || 'Unknown Device'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                                            {alert.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                            {alert.message}
                                        </p>
                                        
                                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {new Date(alert.triggered_at).toLocaleString()}
                                            </div>
                                            {alert.downtime && (
                                                <div>Downtime: {alert.downtime}</div>
                                            )}
                                        </div>
                                        
                                        {alert.acknowledged && (
                                            <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                    <CheckCircle2 className="inline size-4 mr-1" />
                                                    Acknowledged by {alert.acknowledged_by} 
                                                    {alert.reason && `: ${alert.reason}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="ml-4">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                            alert.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MonitorLayout>
    );
}
