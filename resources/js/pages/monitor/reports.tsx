import MonitorLayout from '@/layouts/monitor-layout';
import { AlertTriangle, CheckCircle2, Clock, FileText, Printer, TrendingDown, TrendingUp, WifiOff, Download, Calendar, BarChart3, PieChart, Activity, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import type { CurrentBranch } from '@/types/branch';

// Helper function to format uptime duration from minutes
const formatUptimeDuration = (uptimeMinutes: number): string => {
    if (uptimeMinutes === 0) return '0m';
    
    const minutes = uptimeMinutes;
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    
    if (weeks > 0) {
        const remainingDays = days % 7;
        return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks}w`;
    } else if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
        return `${minutes}m`;
    }
};

interface DeviceEvent {
    id: string;
    deviceName: string;
    deviceIp: string;
    eventType: 'up' | 'down';
    timestamp: Date;
    duration?: string;
    category: string;
}

interface UptimeStat {
    device: string;
    uptime: number;
    downtime: string;
    incidents: number;
    category: string;
    lastIncident?: string;
}

export default function Reports() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { props } = usePage<PageProps>();
    const { currentBranch } = props;
    
    const [dateRange, setDateRange] = useState('7days');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [uptimeStats, setUptimeStats] = useState<UptimeStat[]>([]);
    const [deviceEvents, setDeviceEvents] = useState<DeviceEvent[]>([]);
    const [categoryStatsData, setCategoryStatsData] = useState<any[]>([]);
    const [alertSummary, setAlertSummary] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allDevices, setAllDevices] = useState<any[]>([]);

    // Fetch real data from API
    useEffect(() => {
        if (!currentBranch?.id) return;
        
        setIsLoading(true);
        
        // Fetch devices for calculations
        fetch(`/api/devices?branch_id=${currentBranch.id}&per_page=10000&include_inactive=true`)
            .then(res => res.ok ? res.json() : { data: [] })
            .then(responseData => {
                const devices = responseData.data || responseData;
                setAllDevices(devices);
            })
            .catch(err => console.error('Error fetching devices:', err));
        
        // Fetch summary
        fetch(`/api/reports/summary?branch_id=${currentBranch.id}&date_range=${dateRange}`)
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error('Error fetching summary:', err));
        
        // Fetch uptime stats
        fetch(`/api/reports/uptime-stats?branch_id=${currentBranch.id}&date_range=${dateRange}`)
            .then(res => res.json())
            .then(data => setUptimeStats(data))
            .catch(err => console.error('Error fetching uptime stats:', err));
        
        // Fetch device events
        fetch(`/api/reports/device-events?branch_id=${currentBranch.id}&date_range=${dateRange}&limit=50`)
            .then(res => res.json())
            .then(data => {
                const events = data.map((event: any) => ({
                    ...event,
                    timestamp: new Date(event.timestamp)
                }));
                setDeviceEvents(events);
            })
            .catch(err => console.error('Error fetching device events:', err));
        
        // Fetch category stats
        fetch(`/api/reports/category-stats?branch_id=${currentBranch.id}`)
            .then(res => res.json())
            .then(data => setCategoryStatsData(data))
            .catch(err => console.error('Error fetching category stats:', err));
        
        // Fetch alert summary
        fetch(`/api/reports/alert-summary?branch_id=${currentBranch.id}&date_range=${dateRange}`)
            .then(res => res.json())
            .then(data => setAlertSummary(data))
            .catch(err => console.error('Error fetching alert summary:', err))
            .finally(() => setIsLoading(false));
    }, [currentBranch?.id, dateRange]);

    const filteredStats = selectedCategory === 'all' 
        ? uptimeStats 
        : uptimeStats.filter(stat => stat.category === selectedCategory);

    const categories = ['all', 'Switches', 'Servers', 'WiFi', 'TAS', 'CCTV'];

    // Calculate category statistics
    const categoryStats = {
        Switches: uptimeStats.filter(s => s.category === 'Switches'),
        Servers: uptimeStats.filter(s => s.category === 'Servers'),
        WiFi: uptimeStats.filter(s => s.category === 'WiFi'),
        TAS: uptimeStats.filter(s => s.category === 'TAS'),
        CCTV: uptimeStats.filter(s => s.category === 'CCTV'),
    };

    const getUptimeClass = (uptime: number) => {
        if (uptime >= 99.9) return 'excellent';
        if (uptime >= 99.5) return 'good';
        if (uptime >= 99) return 'fair';
        return 'poor';
    };

    const getUptimeColors = (uptime: number) => {
        if (uptime >= 99.9) return { 
            bg: 'bg-emerald-50 dark:bg-emerald-950/20', 
            text: 'text-emerald-700 dark:text-emerald-400',
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-100 dark:bg-emerald-900/30'
        };
        if (uptime >= 99.5) return { 
            bg: 'bg-green-50 dark:bg-green-950/20', 
            text: 'text-green-700 dark:text-green-400',
            bar: 'bg-green-500',
            badge: 'bg-green-100 dark:bg-green-900/30'
        };
        if (uptime >= 99) return { 
            bg: 'bg-amber-50 dark:bg-amber-950/20', 
            text: 'text-amber-700 dark:text-amber-400',
            bar: 'bg-amber-500',
            badge: 'bg-amber-100 dark:bg-amber-900/30'
        };
        return { 
            bg: 'bg-red-50 dark:bg-red-950/20', 
            text: 'text-red-700 dark:text-red-400',
            bar: 'bg-red-500',
            badge: 'bg-red-100 dark:bg-red-900/30'
        };
    };

    const handleExport = () => {
        const dateRangeLabel = 
            dateRange === '24hours' ? 'Last 24 Hours' :
            dateRange === '7days' ? 'Last 7 Days' :
            dateRange === '30days' ? 'Last 30 Days' : 'Last 90 Days';
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const branchName = currentBranch.name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Summary statistics
        const totalDevices = filteredStats.length;
        const onlineDevices = allDevices.filter(d => d.status === 'online').length;
        const offlineDevices = allDevices.filter(d => d.status === 'offline').length;
        const warningDevices = allDevices.filter(d => d.status === 'warning').length;
        const acknowledgedDevices = allDevices.filter(d => d.status === 'offline_ack').length;
        const avgUptime = totalDevices > 0 
            ? (filteredStats.reduce((sum, stat) => sum + (stat.uptime || 0), 0) / totalDevices).toFixed(2)
            : '0.00';
        const totalIncidents = filteredStats.reduce((sum, stat) => sum + stat.incidents, 0);

        // Category breakdown
        const categoryBreakdown = {
            'Switches': allDevices.filter(d => d.category === 'switches').length,
            'Servers': allDevices.filter(d => d.category === 'servers').length,
            'WiFi': allDevices.filter(d => d.category === 'wifi').length,
            'TAS': allDevices.filter(d => d.category === 'tas').length,
            'CCTV': allDevices.filter(d => d.category === 'cctv').length,
        };

        // Build comprehensive CSV content with better formatting
        const separator = '='.repeat(80);
        const csvContent = [
            // Header section with styling
            [separator],
            ['UTHM HOST MONITORING SYSTEM'],
            ['DEVICE UPTIME & PERFORMANCE REPORT'],
            [separator],
            [''],
            ['Report Information'],
            ['---'],
            ['Generated Date & Time:', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })],
            ['Branch:', `${currentBranch.name} (${currentBranch.code})`],
            ['Report Period:', dateRangeLabel],
            ['Category Filter:', selectedCategory === 'all' ? 'All Devices' : selectedCategory],
            ['Timezone:', 'Asia/Kuala_Lumpur (GMT+8)'],
            [''],
            
            // Executive Summary with borders
            [separator],
            ['EXECUTIVE SUMMARY'],
            [separator],
            ['Metric', 'Value', 'Percentage'],
            ['---', '---', '---'],
            ['Total Devices Monitored', totalDevices, '100%'],
            ['Online Devices', onlineDevices, `${((onlineDevices/totalDevices)*100).toFixed(1)}%`],
            ['Offline Devices', offlineDevices, `${((offlineDevices/totalDevices)*100).toFixed(1)}%`],
            ['Warning Devices', warningDevices, `${((warningDevices/totalDevices)*100).toFixed(1)}%`],
            ['Acknowledged Offline', acknowledgedDevices, `${((acknowledgedDevices/totalDevices)*100).toFixed(1)}%`],
            ['Average Uptime', `${avgUptime}%`, ''],
            ['Total Incidents', totalIncidents, ''],
            [''],

            // Category Distribution with borders
            [separator],
            ['DEVICE DISTRIBUTION BY CATEGORY'],
            [separator],
            ['Category', 'Device Count', 'Percentage', 'Status'],
            ['---', '---', '---', '---'],
            ...Object.entries(categoryBreakdown).map(([cat, count]) => 
                [cat, count, `${((count/totalDevices)*100).toFixed(1)}%`, count > 0 ? 'Active' : 'No Devices']
            ),
            [''],

            // Detailed Device Information with improved formatting
            [separator],
            ['DETAILED DEVICE STATISTICS'],
            [separator],
            [
                'Device Name', 'IP Address', 'MAC Address', 'Status', 'Category', 
                'Manufacturer', 'Model', 'Barcode', 'Location', 'Building',
                'Uptime %', 'Downtime', 'Response Time', 'Incidents', 
                'Last Check', 'Last Incident', 'Health Status'
            ],
            ['---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---'],
            ...filteredStats.sort((a, b) => b.uptime - a.uptime).map(stat => {
                const device = allDevices.find(d => d.name === stat.device);
                const healthStatus = 
                    stat.uptime >= 99.9 ? 'EXCELLENT ★★★★★' :
                    stat.uptime >= 99.5 ? 'GOOD ★★★★' :
                    stat.uptime >= 99 ? 'FAIR ★★★' : 'POOR ★';
                
                return [
                    stat.device,
                    device?.ip_address || 'N/A',
                    device?.mac_address || 'N/A',
                    device?.status?.toUpperCase() || 'UNKNOWN',
                    stat.category,
                    device?.manufacturer || 'N/A',
                    device?.model || 'N/A',
                    device?.barcode || 'N/A',
                    device?.location || 'N/A',
                    device?.building || 'N/A',
                    `${stat.uptime}%`,
                    stat.downtime,
                    device?.response_time ? `${device.response_time}ms` : 'N/A',
                    stat.incidents,
                    device?.last_check ? new Date(device.last_check).toLocaleString() : 'Never',
                    stat.lastIncident,
                    healthStatus
                ];
            }),
            [''],

            // Category Performance Summary with enhanced formatting
            [separator],
            ['CATEGORY PERFORMANCE ANALYSIS'],
            [separator],
            ['Category', 'Device Count', 'Avg Uptime %', 'Total Incidents', 'Health Rating', 'Status'],
            ['---', '---', '---', '---', '---', '---'],
            ...Object.entries(categoryBreakdown).map(([category, count]) => {
                const categoryKey = category.toLowerCase();
                const categoryDevices = filteredStats.filter(s => 
                    s.category.toLowerCase() === categoryKey || 
                    (categoryKey === 'wifi' && s.category.toLowerCase() === 'wifi')
                );
                const avgCatUptime = categoryDevices.length > 0
                    ? (categoryDevices.reduce((sum, d) => sum + d.uptime, 0) / categoryDevices.length).toFixed(2)
                    : '0.00';
                const catIncidents = categoryDevices.reduce((sum, d) => sum + d.incidents, 0);
                const healthRating = 
                    parseFloat(avgCatUptime) >= 99.9 ? 'EXCELLENT ★★★★★' :
                    parseFloat(avgCatUptime) >= 99.5 ? 'GOOD ★★★★' :
                    parseFloat(avgCatUptime) >= 99 ? 'FAIR ★★★' : 'POOR ★';
                const status = count > 0 ? 'Operational' : 'No Devices';
                
                return [category, count, `${avgCatUptime}%`, catIncidents, healthRating, status];
            }),
            [''],

            // Location Analysis
            [separator],
            ['LOCATION ANALYSIS'],
            [separator],
            ['Location', 'Device Count', 'Avg Uptime %', 'Status'],
            ['---', '---', '---', '---'],
            ...Array.from(new Set(allDevices.map(d => d.location).filter(Boolean))).map(location => {
                const locationDevices = allDevices.filter(d => d.location === location);
                const avgLocUptime = locationDevices.length > 0
                    ? (locationDevices.reduce((sum, d) => sum + (d.uptime_percentage || 0), 0) / locationDevices.length).toFixed(2)
                    : '0.00';
                const status = parseFloat(avgLocUptime) >= 99 ? 'Healthy' : 'Needs Attention';
                return [location, locationDevices.length, `${avgLocUptime}%`, status];
            }),
            [''],

            // Critical Devices
            [separator],
            ['DEVICES REQUIRING ATTENTION (Uptime < 99%)'],
            [separator],
            ['Device Name', 'IP Address', 'Category', 'Location', 'Uptime %', 'Status', 'Priority', 'Action Required'],
            ['---', '---', '---', '---', '---', '---', '---', '---'],
            ...filteredStats.filter(stat => stat.uptime < 99).map(stat => {
                const device = allDevices.find(d => d.name === stat.device);
                const priority = stat.uptime < 95 ? '🔴 CRITICAL' : stat.uptime < 97 ? '🟡 HIGH' : '🟢 MEDIUM';
                const action = stat.uptime < 95 ? 'IMMEDIATE ACTION REQUIRED' : stat.uptime < 97 ? 'INVESTIGATE SOON' : 'MONITOR CLOSELY';
                return [
                    stat.device,
                    device?.ip_address || 'N/A',
                    stat.category,
                    device?.location || 'N/A',
                    `${stat.uptime}%`,
                    device?.status?.toUpperCase() || 'UNKNOWN',
                    priority,
                    action
                ];
            }),
            [''],

            // Offline Devices
            [separator],
            ['CURRENTLY OFFLINE DEVICES'],
            [separator],
            ['Device Name', 'IP Address', 'Category', 'Location', 'Barcode', 'Last Seen', 'Offline Duration', 'Reason'],
            ['---', '---', '---', '---', '---', '---', '---', '---'],
            ...allDevices.filter(d => d.status === 'offline' || d.status === 'offline_ack').map(device => [
                device.name,
                device.ip_address,
                device.category.charAt(0).toUpperCase() + device.category.slice(1),
                device.location,
                device.barcode || 'N/A',
                device.last_check ? new Date(device.last_check).toLocaleString() : 'Never',
                device.status === 'offline' ? 'Unknown' : 'Acknowledged',
                device.offline_reason || 'Not specified'
            ]),
            [''],

            // Report Footer
            [separator],
            ['REPORT METADATA'],
            [separator],
            ['Field', 'Value'],
            ['---', '---'],
            ['Report Generated By', 'UTHM Host Monitoring System v6.0'],
            ['Report Type', 'Device Uptime & Performance Analysis'],
            ['Data Source', `${currentBranch.name} Branch Database`],
            ['Total Records', filteredStats.length],
            ['Export Timestamp', timestamp],
            ['Report ID', `RPT-${timestamp}`],
            [''],
            [separator],
            ['END OF REPORT'],
            [separator],
        ].map(row => row.join(',')).join('\n');

        // Create and download CSV file with BOM for Excel compatibility
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `UTHM_Device_Report_${branchName}_${dateRange}_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <MonitorLayout title={t('reports.title')}>
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('reports.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('reports.subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <Download className="size-4" />
                            {t('reports.export')}
                        </button>
                    </div>
                </div>

                {/* Date Range & Category Filters */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="size-5 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Time Period:</span>
                        {[
                            { value: '24hours', label: 'Last 24 Hours' },
                            { value: '7days', label: 'Last 7 Days' },
                            { value: '30days', label: 'Last 30 Days' },
                            { value: '90days', label: 'Last 90 Days' },
                        ].map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setDateRange(range.value)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                    dateRange === range.value
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Server className="size-5 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category:</span>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {category === 'all' ? 'All Devices' : category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg transition-all hover:scale-105 print:shadow-none dark:border-emerald-900/50 dark:from-emerald-950/50 dark:to-green-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Average Uptime</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                                    {isLoading ? '...' : `${summary?.avgUptime || 0}%`}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="size-3" />
                                    {isLoading ? 'Loading...' : `All systems operational`}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-3 shadow-lg">
                                <CheckCircle2 className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-lg transition-all hover:scale-105 print:shadow-none dark:border-red-900/50 dark:from-red-950/50 dark:to-orange-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Incidents</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                                    {isLoading ? '...' : summary?.totalIncidents || 0}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                    <TrendingDown className="size-3" />
                                    {isLoading ? 'Loading...' : 'from last period'}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-red-500 to-orange-600 p-3 shadow-lg">
                                <AlertTriangle className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg transition-all hover:scale-105 print:shadow-none dark:border-amber-900/50 dark:from-amber-950/50 dark:to-orange-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Downtime</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                                    {isLoading ? '...' : summary?.totalDowntime?.formatted || '0m'}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                    <Clock className="size-3" />
                                    {isLoading ? 'Loading...' : `${summary?.totalDowntime?.percentage || 0}% of total time`}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 shadow-lg">
                                <WifiOff className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg transition-all hover:scale-105 print:shadow-none dark:border-blue-900/50 dark:from-blue-950/50 dark:to-indigo-950/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Devices Monitored</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                                    {isLoading ? '...' : summary?.devicesMonitored || 0}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                    <Activity className="size-3" />
                                    {isLoading ? 'Loading...' : 'All systems operational'}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                                <Server className="size-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Performance Overview */}
                <div className="grid gap-4 lg:grid-cols-5">
                    {Object.entries(categoryStats).map(([category, devices]) => {
                        const avgUptime = (devices.reduce((sum, d) => sum + d.uptime, 0) / devices.length).toFixed(2);
                        const totalIncidents = devices.reduce((sum, d) => sum + d.incidents, 0);
                        const colors = getUptimeColors(parseFloat(avgUptime));
                        
                        return (
                            <div key={category} className={`rounded-xl border border-slate-200 dark:border-slate-700 ${colors.bg} p-4 shadow-md print:shadow-none`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category}</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{devices.length} devices</p>
                                    </div>
                                    <div className={`rounded-lg ${colors.badge} p-1.5`}>
                                        {category === 'Servers' ? <Server className="size-4" /> : 
                                         category === 'Switches' ? <Activity className="size-4" /> : 
                                         <BarChart3 className="size-4" />}
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600 dark:text-slate-400">Avg Uptime</span>
                                            <span className={`font-bold ${colors.text}`}>{avgUptime}%</span>
                                        </div>
                                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white dark:bg-slate-700">
                                            <div className={`h-full ${colors.bar}`} style={{ width: `${avgUptime}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600 dark:text-slate-400">Total Incidents</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{totalIncidents}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Uptime Statistics Table */}
                <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2 shadow-lg">
                                <BarChart3 className="size-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Device Uptime Statistics
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Showing {filteredStats.length} devices • Sorted by uptime percentage
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Device Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Uptime %
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Downtime
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Incidents
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Last Incident
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Health
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredStats.sort((a, b) => b.uptime - a.uptime).map((stat, idx) => {
                                    const colors = getUptimeColors(stat.uptime);
                                    return (
                                        <tr key={idx} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-lg ${colors.badge} p-2`}>
                                                        <Server className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {stat.device}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                    {stat.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className={`h-full ${colors.bar}`}
                                                            style={{ width: `${stat.uptime}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${colors.text}`}>
                                                        {stat.uptime}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {stat.downtime}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center justify-center rounded-full ${
                                                    stat.incidents === 0 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                        : stat.incidents <= 2 
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                } px-2 py-1 text-xs font-bold`}>
                                                    {stat.incidents}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {stat.lastIncident}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full ${colors.badge} ${colors.text} px-3 py-1.5 text-xs font-bold uppercase`}
                                                >
                                                    {stat.uptime >= 99.9 ? (
                                                        <>
                                                            <CheckCircle2 className="size-3" />
                                                            Excellent
                                                        </>
                                                    ) : stat.uptime >= 99.5 ? (
                                                        <>
                                                            <CheckCircle2 className="size-3" />
                                                            Good
                                                        </>
                                                    ) : stat.uptime >= 99 ? (
                                                        <>
                                                            <AlertTriangle className="size-3" />
                                                            Fair
                                                        </>
                                                    ) : (
                                                        <>
                                                            <WifiOff className="size-3" />
                                                            Poor
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Event Timeline with Enhanced Design */}
                <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <div className="border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-slate-700/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                <Activity className="size-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Recent Events Timeline
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Chronological log of all device status changes
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="relative space-y-6">
                            {/* Timeline line */}
                            <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900" />
                            
                            {deviceEvents.map((event) => {
                                const isUp = event.eventType === 'up';
                                return (
                                    <div key={event.id} className="relative flex gap-6 pl-12">
                                        {/* Timeline dot */}
                                        <div className={`absolute left-[13px] top-3 size-5 rounded-full border-4 ${
                                            isUp 
                                                ? 'border-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-900' 
                                                : 'border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-900'
                                        }`}>
                                            <div className={`absolute inset-0 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500'} animate-ping opacity-75`} />
                                        </div>
                                        
                                        <div className="flex-1 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`rounded-lg ${
                                                                isUp
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                                    : 'bg-red-100 dark:bg-red-900/30'
                                                            } p-2`}
                                                        >
                                                            {isUp ? (
                                                                <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                                                            ) : (
                                                                <TrendingDown className="size-5 text-red-600 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white">
                                                                {event.deviceName}
                                                            </p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {event.deviceIp} • {event.category}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-4 text-sm">
                                                        <span
                                                            className={`font-semibold ${
                                                                isUp
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {isUp ? '✓ Came Online' : '✗ Went Offline'}
                                                        </span>
                                                        {event.duration && (
                                                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                                <Clock className="size-3" />
                                                                Duration: {event.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {event.timestamp.toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                                        {event.timestamp.toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </MonitorLayout>
    );
}
