import { Head } from '@inertiajs/react';
import MonitorLayout from '@/layouts/monitor-layout';
import {
    AlertCircle,
    ArrowUpDown,
    Building2,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Grid3x3,
    List,
    MapPin,
    Network,
    RefreshCw,
    Search,
    Server,
    User,
    Wifi,
    WifiOff,
    X,
    Barcode,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { useBranch } from '@/contexts/branch-context';
import { router } from '@inertiajs/react';

type DeviceCategory = 'all' | 'switches' | 'servers' | 'wifi' | 'tas' | 'cctv';
type DeviceStatus = 'online' | 'offline' | 'warning' | 'unknown' | 'offline_ack';

interface Device {
    id: number;
    name: string;
    ip_address: string;
    mac_address: string;
    barcode: string;
    type: string;
    category: DeviceCategory;
    status: DeviceStatus;
    location: string;
    building: string;
    manufacturer: string;
    model: string;
    priority: number;
    uptime_percentage: number;
    response_time: number | null;
    is_monitored?: boolean;
    is_active?: boolean;
    last_check: string | null;
    created_at?: string;
    updated_at?: string;
    offline_reason?: string;
    offline_acknowledged_by?: string;
    offline_acknowledged_at?: string;
    latitude?: number;
    longitude?: number;
    branch_id?: number;
}

const categories = [
    { id: 'all' as DeviceCategory, name: 'All Devices', icon: Network, count: 0 },
    { id: 'switches' as DeviceCategory, name: 'Switch', icon: Network, count: 0, description: 'Peralatan nadi utama rangkaian UTHM' },
    { id: 'servers' as DeviceCategory, name: 'Server', icon: Server, count: 0, description: 'Sistem aplikasi dan Web untuk kegunaan pengguna UTHM' },
    { id: 'wifi' as DeviceCategory, name: 'WiFi', icon: Wifi, count: 0, description: 'Kemudahan wifi yang disediakan untuk seluruh kawasan UTHM' },
    { id: 'tas' as DeviceCategory, name: 'TAS', icon: Building2, count: 0, description: 'Peralatan sistem kehadiran UTHM' },
    { id: 'cctv' as DeviceCategory, name: 'CCTV', icon: Camera, count: 0, description: 'Pemantauan CCTV' },
];

// Status helper functions for display
const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
        case 'online':
            return 'text-green-600 dark:text-green-400';
        case 'offline':
            return 'text-red-600 dark:text-red-400';
        case 'offline_ack':
            return 'text-blue-600 dark:text-blue-400';
        case 'warning':
            return 'text-yellow-600 dark:text-yellow-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

const getStatusBg = (status: DeviceStatus) => {
    switch (status) {
        case 'online':
            return 'bg-green-100 dark:bg-green-900/20';
        case 'offline':
            return 'bg-red-100 dark:bg-red-900/20';
        case 'offline_ack':
            return 'bg-blue-100 dark:bg-blue-900/20';
        case 'warning':
            return 'bg-yellow-100 dark:bg-yellow-900/20';
        default:
            return 'bg-gray-100 dark:bg-gray-900/20';
    }
};

const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
        case 'online':
            return <CheckCircle2 className="size-4" />;
        case 'offline':
            return <WifiOff className="size-4" />;
        case 'offline_ack':
            return <AlertCircle className="size-4" />;
        case 'warning':
            return <AlertCircle className="size-4" />;
        default:
            return <AlertCircle className="size-4" />;
    }
};

const getStatusLabel = (status: DeviceStatus) => {
    switch (status) {
        case 'offline_ack':
            return 'OFFLINE (ACK)';
        case 'online':
            return 'ONLINE';
        case 'offline':
            return 'OFFLINE';
        case 'warning':
            return 'WARNING';
        case 'unknown':
            return 'UNKNOWN';
        default:
            return 'UNKNOWN';
    }
};

type SortField = 'name' | 'ip_address' | 'uptime_percentage' | 'status' | 'location' | 'manufacturer';
type SortOrder = 'asc' | 'desc';

export default function Devices() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { currentBranch } = useBranch();
    const [selectedCategory, setSelectedCategory] = useState<DeviceCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [manufacturerFilter, setManufacturerFilter] = useState<string>('all');
    const [modelFilter, setModelFilter] = useState<string>('all');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [isPinging, setIsPinging] = useState(false);
    const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Get devices from current branch
    const allDevices = currentBranch?.devices || [];

    // Update category counts
    const updatedCategories = categories.map(cat => ({
        ...cat,
        count: cat.id === 'all' 
            ? allDevices.length 
            : allDevices.filter(d => d.category === cat.id).length
    }));

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedDevice) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedDevice]);

    // Ping button handler - no actual API call
    const handlePingAll = async () => {
        setIsPinging(true);
        // Simulate ping delay
        setTimeout(() => {
            setIsPinging(false);
            setLastPingTime(new Date());
        }, 1000);
    };

    let filteredDevices = selectedCategory === 'all' 
        ? allDevices 
        : allDevices.filter(d => d.category === selectedCategory);

    // Apply search filter
    if (searchQuery) {
        filteredDevices = filteredDevices.filter(d => 
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.ip_address.includes(searchQuery)
        );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
        filteredDevices = filteredDevices.filter(d => d.status === statusFilter);
    }

    // Get unique locations from current branch
    const uniqueLocations = Array.from(new Set(allDevices.map(d => d.location).filter(Boolean)));

    // Get unique manufacturers and models for filters
    const uniqueManufacturers = Array.from(new Set(allDevices.map(d => d.manufacturer))).filter(Boolean);
    const uniqueModels = Array.from(new Set(allDevices.map(d => d.model))).filter(Boolean);

    // Apply location filter
    if (locationFilter !== 'all') {
        filteredDevices = filteredDevices.filter(d => d.location === locationFilter);
    }

    // Apply manufacturer filter
    if (manufacturerFilter !== 'all') {
        filteredDevices = filteredDevices.filter(d => d.manufacturer === manufacturerFilter);
    }

    // Apply model filter
    if (modelFilter !== 'all') {
        filteredDevices = filteredDevices.filter(d => d.model === modelFilter);
    }

    // Sorting function
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Apply sorting
    const sortedDevices = [...filteredDevices].sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        // Safely access the field
        if (sortField === 'uptime_percentage') {
            aValue = a.uptime_percentage || 0;
            bValue = b.uptime_percentage || 0;
        } else {
            aValue = a[sortField] || '';
            bValue = b[sortField] || '';
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Clear all filters function
    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setLocationFilter('all');
        setManufacturerFilter('all');
        setModelFilter('all');
        setSelectedCategory('all');
    };

    const activeFiltersCount = [
        searchQuery,
        statusFilter !== 'all',
        locationFilter !== 'all',
        manufacturerFilter !== 'all',
        modelFilter !== 'all',
        selectedCategory !== 'all',
    ].filter(Boolean).length;

    return (
        <MonitorLayout title={t('devices.title')}>
            <div className="space-y-6">
                {/* Header with Branch Info */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                            <Building2 className="size-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {currentBranch?.name || 'No Branch Selected'}
                            </h2>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                {currentBranch?.description || 'Please select a branch'} • {currentBranch?.deviceCount || 0} devices
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div>
                    <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                        {t('devices.title')}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {t('devices.subtitle')}
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4">
                    {/* Top Row - Search and Quick Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('devices.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Ping All Button */}
                            <button
                                onClick={handlePingAll}
                                disabled={isPinging}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    isPinging
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                }`}
                                title="Ping all devices"
                            >
                                <RefreshCw className={`size-4 ${isPinging ? 'animate-spin' : ''}`} />
                                {isPinging ? t('devices.pinging') : t('devices.pingAll')}
                            </button>

                            {/* Last Ping Time */}
                            {lastPingTime && (
                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                    <Clock className="size-3" />
                                    {t('devices.lastPing')}: {lastPingTime.toLocaleTimeString()}
                                </div>
                            )}

                            {/* View Toggle */}
                            <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-md p-2 transition-all ${
                                        viewMode === 'grid'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                    title="Grid View"
                                >
                                    <Grid3x3 className="size-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-md p-2 transition-all ${
                                        viewMode === 'list'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                    title="List View"
                                >
                                    <List className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filters */}
                        {(['all', 'online', 'warning', 'offline', 'offline_ack'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    statusFilter === status
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                            >
                                {status === 'all' ? t('devices.all') : 
                                 status === 'offline_ack' ? 'Offline (Ack)' :
                                 status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}

                        {/* Advanced Filters Toggle */}
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                showAdvancedFilters || manufacturerFilter !== 'all' || modelFilter !== 'all' || locationFilter !== 'all'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                        >
                            Advanced Filters
                            {showAdvancedFilters ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>

                        {/* Clear All Filters */}
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                                <X className="size-4" />
                                Clear All ({activeFiltersCount})
                            </button>
                        )}
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-4 shadow-inner dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Location Filter */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Location
                                    </label>
                                    <select
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="all">All Locations</option>
                                        {uniqueLocations.map((location) => (
                                            <option key={location} value={location}>
                                                {location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Manufacturer Filter */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Manufacturer
                                    </label>
                                    <select
                                        value={manufacturerFilter}
                                        onChange={(e) => setManufacturerFilter(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="all">All Manufacturers</option>
                                        {uniqueManufacturers.map((manufacturer) => (
                                            <option key={manufacturer} value={manufacturer}>
                                                {manufacturer}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Model Filter */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Model
                                    </label>
                                    <select
                                        value={modelFilter}
                                        onChange={(e) => setModelFilter(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="all">All Models</option>
                                        {uniqueModels.map((model) => (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(manufacturerFilter !== 'all' || modelFilter !== 'all' || locationFilter !== 'all') && (
                                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Active:
                                    </span>
                                    {locationFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            Location: {locationFilter}
                                            <button
                                                onClick={() => setLocationFilter('all')}
                                                className="hover:text-blue-900 dark:hover:text-blue-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                    {manufacturerFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                            Manufacturer: {manufacturerFilter}
                                            <button
                                                onClick={() => setManufacturerFilter('all')}
                                                className="hover:text-purple-900 dark:hover:text-purple-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                    {modelFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                                            Model: {modelFilter}
                                            <button
                                                onClick={() => setModelFilter('all')}
                                                className="hover:text-pink-900 dark:hover:text-pink-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {updatedCategories.map((category) => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`group flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105 ${
                                    isActive
                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg dark:border-blue-400 dark:from-blue-950/30 dark:to-indigo-950/30'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                                }`}
                                title={category.description}
                            >
                                <div className={`rounded-full p-3 transition-all ${
                                    isActive 
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg' 
                                        : 'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-700 dark:group-hover:bg-slate-600'
                                }`}>
                                    <Icon
                                        className={`size-6 ${
                                            isActive
                                                ? 'text-white'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    />
                                </div>
                                <div className="text-center">
                                    <p
                                        className={`text-sm font-bold ${
                                            isActive
                                                ? 'text-blue-900 dark:text-blue-100'
                                                : 'text-slate-900 dark:text-white'
                                        }`}
                                    >
                                        {category.name}
                                    </p>
                                    {category.description && (
                                        <p className={`mt-1 text-xs line-clamp-2 ${
                                            isActive
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {category.description}
                                        </p>
                                    )}
                                    <p
                                        className={`mt-1 text-xs font-semibold ${
                                            isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        {category.count} {t('common.devices')}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Empty State */}
                {sortedDevices.length === 0 && (
                    <div className="rounded-2xl border border-slate-200/50 bg-white p-12 text-center shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                        <Server className="mx-auto mb-4 size-12 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t('devices.noDevices')}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {searchQuery || statusFilter !== 'all' || selectedCategory !== 'all'
                                ? t('devices.tryAdjustingFilters')
                                : t('devices.noDevicesConfigured')}
                        </p>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && sortedDevices.length > 0 && (
                    <div>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {categories.find(c => c.id === selectedCategory)?.name || 'All Devices'}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                            {filteredDevices.map((device) => (
                                <div
                                    key={device.id}
                                    className="group cursor-pointer rounded-xl border border-slate-200/50 bg-white p-3 shadow transition-all hover:scale-105 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800"
                                    onClick={() => setSelectedDevice(device as Device)}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className={`mb-2 rounded-lg border p-2 transition-transform group-hover:scale-110 ${getStatusBg(device.status as DeviceStatus)}`}
                                        >
                                            <Server
                                                className={`size-6 ${getStatusColor(device.status as DeviceStatus)}`}
                                            />
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                            {device.name}
                                        </h3>
                                        <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">
                                            {device.ip_address}
                                        </p>
                                        <div className="mb-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Clock className="size-3" />
                                            <span>{device.uptime_percentage}%</span>
                                        </div>
                                        <span
                                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBg(device.status as DeviceStatus)} ${getStatusColor(device.status as DeviceStatus)}`}
                                        >
                                            {getStatusIcon(device.status as DeviceStatus)}
                                            {getStatusLabel(device.status as DeviceStatus)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'list' && sortedDevices.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800 overflow-hidden">
                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                                    <Server className="size-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {categories.find(c => c.id === selectedCategory)?.name || 'All Devices'}
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {sortedDevices.length} device{sortedDevices.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Name
                                                {sortField === 'name' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('ip_address')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                IP Address
                                                {sortField === 'ip_address' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('uptime_percentage')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Uptime
                                                {sortField === 'uptime_percentage' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Status
                                                {sortField === 'status' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('location')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Location
                                                {sortField === 'location' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('manufacturer')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Manufacturer
                                                {sortField === 'manufacturer' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {sortedDevices.map((device) => (
                                        <tr
                                            key={device.id}
                                            className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                            onClick={() => setSelectedDevice(device as Device)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-lg border p-2 ${getStatusBg(device.status as DeviceStatus)}`}>
                                                        <Server className={`size-4 ${getStatusColor(device.status as DeviceStatus)}`} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {device.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                    {device.ip_address}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Clock className="size-4" />
                                                    {device.uptime_percentage}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBg(device.status as DeviceStatus)} ${getStatusColor(device.status as DeviceStatus)}`}>
                                                    {getStatusIcon(device.status as DeviceStatus)}
                                                    {getStatusLabel(device.status as DeviceStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {device.location}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {device.manufacturer && device.model ? `${device.manufacturer} ${device.model}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Device Detail Modal */}
                {selectedDevice && (
                    <>
                        <div
                            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md"
                            onClick={() => setSelectedDevice(null)}
                        />
                        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-slate-900">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-200/50 p-6 dark:border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`rounded-xl border p-3 ${getStatusBg(selectedDevice.status)}`}
                                    >
                                        <Server
                                            className={`size-6 ${getStatusColor(selectedDevice.status)}`}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {selectedDevice.name}
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {selectedDevice.ip_address}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDevice(null)}
                                    className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="max-h-[70vh] overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Status */}
                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            Status
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusBg(selectedDevice.status)} ${getStatusColor(selectedDevice.status)}`}
                                            >
                                                {getStatusIcon(selectedDevice.status)}
                                                {getStatusLabel(selectedDevice.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Uptime */}
                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            Uptime
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Clock className="size-4" />
                                            <span className="text-lg font-semibold">{selectedDevice.uptime_percentage}%</span>
                                        </div>
                                    </div>

                                    {selectedDevice.status === 'offline' && (
                                        <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/20">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-red-700 dark:text-red-400">
                                                        Device Offline
                                                    </p>
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        This device is currently offline and not responding to monitoring requests.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedDevice.status === 'offline_ack' && selectedDevice.offline_reason && (
                                        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-blue-700 dark:text-blue-400">
                                                        Offline - Acknowledged
                                                    </p>
                                                    <div className="mt-3 rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-900/30 dark:bg-blue-950/30">
                                                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                                            Reason:
                                                        </p>
                                                        <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">
                                                            {selectedDevice.offline_reason}
                                                        </p>
                                                        {selectedDevice.offline_acknowledged_by && (
                                                            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                                                <User className="size-3" />
                                                                <span>Acknowledged by {selectedDevice.offline_acknowledged_by}</span>
                                                                {selectedDevice.offline_acknowledged_at && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{new Date(selectedDevice.offline_acknowledged_at).toLocaleString()}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedDevice.status === 'warning' && (
                                        <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-950/20">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                                                        Device Warning
                                                    </p>
                                                    <div className="mt-3 space-y-3">
                                                        <div className="rounded-lg border border-yellow-200 bg-white p-3 dark:border-yellow-900/30 dark:bg-yellow-950/30">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-yellow-700 dark:text-yellow-300">Response Time:</span>
                                                                    <span className="font-bold text-yellow-900 dark:text-yellow-200">
                                                                        {selectedDevice.response_time ? `${selectedDevice.response_time}ms` : 'N/A'}
                                                                        {selectedDevice.response_time && selectedDevice.response_time > 100 && (
                                                                            <span className="ml-2 text-xs">(High)</span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-yellow-700 dark:text-yellow-300">Uptime:</span>
                                                                    <span className="font-bold text-yellow-900 dark:text-yellow-200">
                                                                        {selectedDevice.uptime_percentage}%
                                                                        {selectedDevice.uptime_percentage < 95 && (
                                                                            <span className="ml-2 text-xs">(Below threshold)</span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-yellow-700 dark:text-yellow-300">Last Check:</span>
                                                                    <span className="font-medium text-yellow-900 dark:text-yellow-200">
                                                                        {selectedDevice.last_check 
                                                                            ? new Date(selectedDevice.last_check).toLocaleString()
                                                                            : 'Never'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
                                                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                                                                Possible Issues:
                                                            </p>
                                                            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                                                                {selectedDevice.response_time && selectedDevice.response_time > 100 && (
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="mt-1 size-1 rounded-full bg-yellow-600 dark:bg-yellow-400" />
                                                                        <span>High response time detected - Network congestion or device overload</span>
                                                                    </li>
                                                                )}
                                                                {selectedDevice.uptime_percentage < 95 && (
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="mt-1 size-1 rounded-full bg-yellow-600 dark:bg-yellow-400" />
                                                                        <span>Uptime below 95% - Intermittent connectivity issues</span>
                                                                    </li>
                                                                )}
                                                                <li className="flex items-start gap-2">
                                                                    <span className="mt-1 size-1 rounded-full bg-yellow-600 dark:bg-yellow-400" />
                                                                    <span>Device requires attention - Monitor closely for potential failures</span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                                            <p className="font-medium">Recommended Action:</p>
                                                            <p className="mt-1">
                                                                Schedule maintenance check or investigate network connectivity to prevent potential downtime.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Device Information */}
                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            Device Information
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Category:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {categories.find(c => c.id === selectedDevice.category)?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">IP Address:</span>
                                                <span className="font-medium text-slate-900 dark:text-white font-mono">
                                                    {selectedDevice.ip_address}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">MAC Address:</span>
                                                <span className="font-medium text-slate-900 dark:text-white font-mono">
                                                    {selectedDevice.mac_address}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Barcode:</span>
                                                <div className="flex items-center gap-2">
                                                    <Barcode className="size-4 text-slate-500 dark:text-slate-400" />
                                                    <span className="font-medium text-slate-900 dark:text-white font-mono">
                                                        {selectedDevice.barcode}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Location:</span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDevice(null);
                                                        router.visit('/monitor/maps', {
                                                            data: {
                                                                deviceId: selectedDevice.id,
                                                                lat: selectedDevice.latitude,
                                                                lng: selectedDevice.longitude,
                                                            }
                                                        });
                                                    }}
                                                    className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                >
                                                    <MapPin className="size-3.5" />
                                                    <span className="font-medium">{selectedDevice.location}</span>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Manufacturer:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.manufacturer}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Model:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.model}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Device ID:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MonitorLayout>
    );
}