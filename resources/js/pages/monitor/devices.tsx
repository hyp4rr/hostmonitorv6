import MonitorLayout from '@/layouts/monitor-layout';
import {
    AlertCircle,
    ArrowUpDown,
    Building2,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Grid3x3,
    List,
    MapPin,
    Network,
    Search,
    Server,
    User,
    Wifi,
    WifiOff,
    X,
    Barcode,
    TrendingUp,
    Zap,
    Info,
    RefreshCw,
    Activity
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { getDeviceCategoryIcon } from '@/utils/device-icons';

type DeviceCategory = 'all' | 'switches' | 'servers' | 'wifi' | 'tas' | 'cctv';
type DeviceStatus = 'online' | 'offline' | 'warning' | 'unknown' | 'offline_ack';

interface Device {
    id: number;
    name: string;
    ip_address: string;
    mac_address: string;
    barcode: string;
    serial_number?: string;
    managed_by?: number;
    managed_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    managed_by_users?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
    type?: string;
    category: DeviceCategory;
    status: DeviceStatus;
    location: string;
    brand: string; // Virtual attribute from backend
    model: string; // Virtual attribute from backend
    priority?: number;
    uptime_percentage: number;
    uptime_minutes: number;
    response_time: number | null;
    is_monitored?: boolean;
    is_active?: boolean;
    last_check: string | null;
    last_ping?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface Device {
    offline_reason?: string;
    offline_acknowledged_by?: string;
    offline_acknowledged_at?: string;
    offline_since?: string;
    offline_duration_minutes?: number;
    offline_alert_sent?: boolean;
    latitude?: number;
    longitude?: number;
    branch_id?: number;
    location_id?: number;
    hardware_detail_id?: number;
    hardware_detail?: {
        id: number;
        brand_id: number;
        model_id: number;
        brand?: { id: number; name: string };
        hardware_model?: { id: number; name: string };
    };
}

interface DeviceComment {
    id: number;
    device_id: number;
    comment: string;
    author?: string;
    type: 'general' | 'maintenance' | 'issue' | 'note';
    created_at: string;
    updated_at: string;
}

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

type SortField = 'name' | 'ip_address' | 'uptime_percentage' | 'status' | 'location' | 'brand';
type SortOrder = 'asc' | 'desc';

export default function Devices() {
    console.log('Devices component rendering!');
    const { t } = useTranslation();
    const { props } = usePage<PageProps>();
    const { currentBranch } = props;
    console.log('Current Branch in render:', currentBranch);
    const [selectedCategory, setSelectedCategory] = useState<DeviceCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');
    const [modelFilter, setModelFilter] = useState<string>('all');
    const [managedByFilter, setManagedByFilter] = useState<string>('all');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [isLoadingSelectedDevice, setIsLoadingSelectedDevice] = useState(false);

    const loadDeviceDetails = useCallback(async (deviceId: number) => {
        try {
            setIsLoadingSelectedDevice(true);
            const res = await fetch(`/api/devices/${deviceId}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (res.ok) {
                const data: Device = await res.json();
                console.log('Loaded device details', data);
                // Only update if this device is still open
                setSelectedDevice(prev => (prev && prev.id === deviceId ? data : prev));
            } else {
                console.warn('Failed to fetch device details', res.status);
            }
        } catch (e) {
            console.error('Failed to load device details', e);
        } finally {
            setIsLoadingSelectedDevice(false);
        }
    }, []);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Add state for filter options from database
    const [availableLocations, setAvailableLocations] = useState<Array<{id: number, name: string}>>([]);
    const [availableBrands, setAvailableBrands] = useState<Array<{id: number, name: string}>>([]);
    const [availableModels, setAvailableModels] = useState<Array<{id: number, name: string, brand_id: number}>>([]);
    const [availableUsers, setAvailableUsers] = useState<Array<{id: number, name: string, email: string, role: string}>>([]);
    
    // State for devices loaded from API
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(300);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    // Category counts state
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
        all: 0,
        switches: 0,
        servers: 0,
        wifi: 0,
        tas: 0,
        cctv: 0,
    });

    // Ping functionality state
    const [isPingingAll, setIsPingingAll] = useState(false);
    const [pingingDeviceId, setPingingDeviceId] = useState<number | null>(null);
    const [lastPingResults, setLastPingResults] = useState<{
        total: number;
        online: number;
        offline: number;
        duration: number;
        timestamp: string;
    } | null>(null);

    // View options (persisted)
    const [viewOptions, setViewOptions] = useState(() => {
        try {
            const raw = localStorage.getItem('deviceGridViewOptions');
            if (raw) return JSON.parse(raw);
        } catch {}
        return {
            showName: false,
            showIp: false,
            showStatus: false,
            dense: true,
            tiny: false,
        } as {
            showName: boolean;
            showIp: boolean;
            showStatus: boolean;
            dense: boolean;
            tiny: boolean;
        };
    });

    useEffect(() => {
        try {
            localStorage.setItem('deviceGridViewOptions', JSON.stringify(viewOptions));
        } catch {}
    }, [viewOptions]);

    // Update category counts with actual totals
    const updatedCategories = categories.map(cat => ({
        ...cat,
        count: categoryCounts[cat.id] || 0
    }));

    // Fetch devices from API with pagination
    const fetchDevices = useCallback(async () => {
        // Fetch all devices without branch requirement
        console.log('fetchDevices called');
        setIsLoadingDevices(true);
        try {
            // Build query params
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: perPage.toString(),
            });
            
            // Add branch filter - use 'all' if currentBranch.id is 'all', otherwise use the branch id
            if (currentBranch?.id) {
                if (currentBranch.id === 'all') {
                    params.append('branch_id', 'all');
                } else {
                    params.append('branch_id', currentBranch.id.toString());
                }
            }
            
            // Add filters if active
            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            
            // Add search filter
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            
            // Add location filter
            if (locationFilter !== 'all') {
                params.append('location', locationFilter);
            }
            
            // Add brand filter
            if (brandFilter !== 'all') {
                params.append('brand', brandFilter);
            }
            
            // Add model filter
            if (modelFilter !== 'all') {
                params.append('model', modelFilter);
            }
            
            // Add managed_by filter
            if (managedByFilter !== 'all') {
                params.append('managed_by', managedByFilter);
            }
            
            // Add sorting params
            params.append('sort_by', sortField);
            params.append('sort_order', sortOrder);
            
            const apiUrl = `/api/devices?${params.toString()}`;
            console.log('Fetching devices from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-cache', // Prevent browser caching
            });
            
            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('API Response data:', responseData);
                
                // Check if response has pagination data
                if (responseData.pagination) {
                    console.log('Setting devices from paginated response:', responseData.data?.length || 0);
                    // Log uptime_minutes for debugging - check first few devices
                    if (responseData.data && responseData.data.length > 0) {
                        const sampleDevices = responseData.data.slice(0, 3);
                        sampleDevices.forEach((device: Device) => {
                            console.log(`Device ${device.name}: uptime_minutes = ${device.uptime_minutes} (type: ${typeof device.uptime_minutes})`);
                        });
                    }
                    setAllDevices(responseData.data || []);
                    setTotalItems(responseData.pagination.total);
                    setTotalPages(responseData.pagination.last_page);
                } else {
                    // Fallback for non-paginated response
                    const devices = responseData.data || responseData;
                    console.log('Setting devices from fallback response:', devices.length);
                    // Don't filter out offline_ack devices - let the status filter handle it
                    setAllDevices(devices);
                }
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setIsLoadingDevices(false);
        }
    }, [currentPage, perPage, selectedCategory, statusFilter, searchQuery, locationFilter, brandFilter, modelFilter, managedByFilter, sortField, sortOrder, currentBranch?.id]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Fetch category counts separately
    const fetchCategoryCounts = useCallback(async () => {
        try {
            // Fetch counts for all categories (with branch filter if available)
            let url = '/api/devices?per_page=1';
            if (currentBranch?.id) {
                if (currentBranch.id === 'all') {
                    url = `/api/devices?branch_id=all&per_page=1`;
                } else {
                    url = `/api/devices?branch_id=${currentBranch.id}&per_page=1`;
                }
            }
            
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const responseData = await response.json();
                if (responseData.pagination) {
                    const totalAll = responseData.pagination.total;
                    
                    // Fetch counts for each category
                    const counts: Record<string, number> = { all: totalAll };
                    
                    for (const cat of ['switches', 'servers', 'wifi', 'tas', 'cctv']) {
                        const catResponse = await fetch(
                            currentBranch?.id === 'all' 
                                ? `/api/devices?branch_id=all&category=${cat}&per_page=1`
                                : `/api/devices?branch_id=${currentBranch?.id}&category=${cat}&per_page=1`,
                            {
                                credentials: 'same-origin',
                                headers: { 'Accept': 'application/json' },
                            }
                        );
                        if (catResponse.ok) {
                            const catData = await catResponse.json();
                            counts[cat] = catData.pagination?.total || 0;
                        }
                    }
                    
                    setCategoryCounts(counts);
                }
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setIsLoadingDevices(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Fetch category counts when branch changes
    useEffect(() => {
        fetchCategoryCounts();
    }, [fetchCategoryCounts]);
    
    // Force fetch devices on component mount
    useEffect(() => {
        console.log('Component mounted, forcing fetchDevices');
        fetchDevices();
    }, [fetchDevices]);
    
    // Auto-refresh devices every 30 seconds to get updated uptime
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Auto-refreshing devices for uptime update...');
            fetchDevices();
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(interval);
    }, [fetchDevices]);
    
    // Ping all devices function
    const pingAllDevices = async () => {
        if (!currentBranch?.id || currentBranch.id === 'all') return;
        
        setIsPingingAll(true);
        try {
            console.log('Starting ping all devices...');
            
            // Calculate dynamic timeout based on device count
            // With new settings: 50 devices per batch, 2s timeout per device, 3s wait per batch
            // Formula: (deviceCount / 50) * 3 seconds + 30 seconds buffer
            const deviceCount = allDevices.length || 0;
            const estimatedBatches = Math.ceil(deviceCount / 50);
            const estimatedSeconds = (estimatedBatches * 3) + 30; // 3s per batch + 30s buffer
            const timeoutMs = Math.max(600000, estimatedSeconds * 1000); // Minimum 10 minutes, or calculated time
            
            console.log(`Ping timeout calculated: ${timeoutMs / 1000}s for ${deviceCount} devices (${estimatedBatches} batches)`);
            
            // Use POST endpoint to actually ping all devices (ultra-fast parallel system)
            const response = await fetch('/ping-all-devices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                signal: AbortSignal.timeout(timeoutMs), // Dynamic timeout based on device count
            });
            
            console.log('Ping all response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ping all response data:', data);
                
                // Check if this is a background job response
                if (data.stats?.status === 'processing') {
                    const estimatedMinutes = Math.ceil((data.stats.estimated_duration_seconds || 60) / 60);
                    alert(`✅ ${data.message}\n\n${data.note}\n\n💡 Estimated completion: ${estimatedMinutes} minute(s). Refresh the page after completion to see updated device statuses.`);
                    
                    // Auto-refresh after estimated duration
                    const refreshDelay = (data.stats.estimated_duration_seconds || 60) * 1000;
                    setTimeout(() => {
                        fetchDevices();
                    }, refreshDelay);
                } else {
                    // Legacy response format (if queue is not running, it might still work synchronously)
                    await fetchDevices();
                    
                    const total = data.stats?.total_devices || 0;
                    const online = data.stats?.online_devices || 0;
                    const offline = data.stats?.offline_devices || 0;
                    const uptime = total > 0 ? ((online / total) * 100).toFixed(1) : 0;
                    const devicesPerSecond = data.stats?.devices_per_second || 0;
                    const errorCount = data.stats?.error_count || 0;
                    
                    let message = `✅ All Devices Pinged Successfully!\n\nTotal Devices: ${total}\nOnline: ${online}\nOffline: ${offline}\nUptime: ${uptime}%\nDuration: ${(data.stats?.ping_duration / 1000 || 0).toFixed(1)}s\nSpeed: ${devicesPerSecond} devices/sec`;
                    
                    if (errorCount > 0) {
                        message += `\nErrors: ${errorCount} (devices marked offline)`;
                    }
                    
                    message += `\n\nAll devices including offline ones have been pinged.`;
                    
                    alert(message);
                }
            } else {
                const errorText = await response.text();
                console.error('Ping all error response:', errorText);
                
                let errorMessage = 'Failed to ping all devices';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                // Specific handling for timeout errors
                if (response.status === 500 && errorMessage.includes('Maximum execution time')) {
                    errorMessage = 'Ping operation took too long. Try with fewer devices or check server timeout settings.';
                }
                
                alert(`❌ ${errorMessage}`);
            }
        } catch (error: unknown) {
            console.error('Error pinging all devices:', error);
            
            if (error instanceof Error && error.name === 'AbortError') {
                alert(`❌ Ping operation timed out. The operation may still be running on the server. Please wait a few minutes and refresh the page to see updated results.`);
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                alert(`❌ Network error while pinging all devices: ${errorMessage}`);
            }
        } finally {
            setIsPingingAll(false);
        }
    };
    
    // Ping single device function
    const pingSingleDevice = async (deviceId: number) => {
        setPingingDeviceId(deviceId);
        try {
            // Use our new real ICMP ping endpoint
            const response = await fetch(`/ping-device/${deviceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Update device in the list
                setAllDevices(prev => prev.map(device => 
                    device.id === deviceId 
                        ? {
                            ...device,
                            status: data.device.status as DeviceStatus,
                            response_time: data.device.response_time,
                            last_ping: data.device.last_ping,
                        }
                        : device
                ));
                
                // Update selected device if it's currently open
                if (selectedDevice && selectedDevice.id === deviceId) {
                    setSelectedDevice({
                        ...selectedDevice,
                        status: data.device.status as DeviceStatus,
                        response_time: data.device.response_time,
                        last_ping: data.device.last_ping,
                    });
                }
                
                // Show detailed result with debug info
                const statusIcon = data.device.status === 'online' ? '🟢' : '🔴';
                const debugInfo = data.debug ? 
                    `\n\nDEBUG INFO:\nPing Command: ${data.debug.ping_command}\nReturn Code: ${data.debug.return_code}\nDB Status: ${data.debug.database_status_after_update}\nDB Response Time: ${data.debug.database_response_time_after_update}ms` : '';
                
                alert(`${statusIcon} ${data.device.name}\n\nStatus: ${data.device.status}\nResponse Time: ${data.device.response_time || 'N/A'}ms\nLast Ping: ${data.device.last_ping}${debugInfo}\n\nNote: Using real ICMP ping`);
            } else {
                const errorData = await response.json();
                alert(`❌ Failed to get device status: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error getting device status:', error);
            alert('❌ Network error while getting device status');
        } finally {
            setPingingDeviceId(null);
        }
    };
    
    // Reset to page 1 when filters or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, statusFilter, searchQuery, locationFilter, brandFilter, modelFilter, managedByFilter, sortField, sortOrder]);

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




    // Devices are already filtered by the backend API
    // No need for client-side filtering - just use the devices from API
    const filteredDevices = allDevices;

    // Get unique locations from availableLocations (loaded from API)
    const uniqueLocations = availableLocations.length > 0 
        ? availableLocations 
        : [];

    // Get unique brands from availableBrands (loaded from API)
    const uniqueBrands = availableBrands.length > 0 
        ? availableBrands 
        : [];

    // Filter models based on selected brand
    const filteredModelsForDropdown = brandFilter !== 'all'
        ? availableModels.filter(m => m.brand_id === parseInt(brandFilter))
        : availableModels;

    // Sorting function
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Devices are already sorted by the API, just use filtered results
    // Apply client-side search filter only (other filters handled by API)
    const sortedDevices = filteredDevices;

    // Clear all filters function
    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setLocationFilter('all');
        setBrandFilter('all');
        setModelFilter('all');
        setManagedByFilter('all');
        setSelectedCategory('all');
    };

    const activeFiltersCount = [
        searchQuery,
        statusFilter !== 'all',
        locationFilter !== 'all',
        brandFilter !== 'all',
        modelFilter !== 'all',
        managedByFilter !== 'all',
        selectedCategory !== 'all',
    ].filter(Boolean).length;

    // Fetch filter options from database when branch changes
    useEffect(() => {
        if (currentBranch?.id) {
            // Fetch locations for current branch (or all branches if 'all')
            const locationsUrl = currentBranch?.id === 'all' 
                ? '/api/locations'
                : `/api/locations?branch_id=${currentBranch.id}`;
            fetch(locationsUrl, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setAvailableLocations(data))
            .catch(err => console.error('Error loading locations:', err));

            // Fetch brands (formerly manufacturers)
            fetch('/api/brands', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setAvailableBrands(data))
            .catch(err => console.error('Error loading brands:', err));

            // Fetch models
            fetch('/api/models', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setAvailableModels(data))
            .catch(err => console.error('Error loading models:', err));

            // Fetch users for managed by filter
            fetch('/api/users', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setAvailableUsers(data))
            .catch(err => console.error('Error loading users:', err));
        }
    }, [currentBranch?.id]);

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
                            {/* Ping All Devices Button */}
                            <button
                                onClick={pingAllDevices}
                                disabled={isPingingAll || isLoadingDevices || !currentBranch?.id || currentBranch?.id === 'all'}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Ping all devices in current branch"
                            >
                                <RefreshCw className={`size-4 ${isPingingAll ? 'animate-spin' : ''}`} />
                                <span>{isPingingAll ? 'Pinging...' : 'Ping All'}</span>
                            </button>
                            
                            {/* Last Ping Results Indicator */}
                            {lastPingResults && (
                                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                    <Activity className="size-4" />
                                    <span>Last: {lastPingResults.online}/{lastPingResults.total} online</span>
                                    <span className="text-xs">({lastPingResults.duration}ms)</span>
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
                                 status === 'offline_ack' ? 'Acknowledged' :
                                 status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}

                        {/* Advanced Filters Toggle */}
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                showAdvancedFilters || brandFilter !== 'all' || modelFilter !== 'all' || locationFilter !== 'all' || managedByFilter !== 'all'
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
                                        <option value="all">All Locations ({uniqueLocations.length})</option>
                                        {uniqueLocations.map((location) => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Filtered by {currentBranch?.name || 'current branch'}
                                    </p>
                                </div>

                                {/* Brand Filter (formerly Manufacturer) */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Brand
                                    </label>
                                    <select
                                        value={brandFilter}
                                        onChange={(e) => {
                                            setBrandFilter(e.target.value);
                                            // Reset model filter when brand changes
                                            if (e.target.value === 'all') {
                                                setModelFilter('all');
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="all">All Brands ({uniqueBrands.length})</option>
                                        {uniqueBrands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        From database
                                    </p>
                                </div>

                                {/* Model Filter */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Model
                                    </label>
                                    <select
                                        value={modelFilter}
                                        onChange={(e) => setModelFilter(e.target.value)}
                                        disabled={brandFilter === 'all'}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="all">
                                            {brandFilter === 'all' 
                                                ? 'Select brand first' 
                                                : `All Models (${filteredModelsForDropdown.length})`}
                                        </option>
                                        {filteredModelsForDropdown.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {brandFilter === 'all' ? 'Dependent on brand' : 'From database'}
                                    </p>
                                </div>

                                {/* Managed By Filter */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Managed By
                                    </label>
                                    <select
                                        value={managedByFilter}
                                        onChange={(e) => setManagedByFilter(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="all">All Users ({availableUsers.length})</option>
                                        <option value="unassigned">Unassigned</option>
                                        {availableUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.role})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Filter by device manager
                                    </p>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(brandFilter !== 'all' || modelFilter !== 'all' || locationFilter !== 'all' || managedByFilter !== 'all') && (
                                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Active:
                                    </span>
                                    {locationFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            Location: {uniqueLocations.find(l => String(l.id) === locationFilter || l.name === locationFilter)?.name || locationFilter}
                                            <button
                                                onClick={() => setLocationFilter('all')}
                                                className="hover:text-blue-900 dark:hover:text-blue-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                    {brandFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                            Brand: {uniqueBrands.find(b => String(b.id) === brandFilter)?.name || brandFilter}
                                            <button
                                                onClick={() => {
                                                    setBrandFilter('all');
                                                    setModelFilter('all');
                                                }}
                                                className="hover:text-purple-900 dark:hover:text-purple-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                    {modelFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                                            Model: {availableModels.find(m => String(m.id) === modelFilter)?.name || modelFilter}
                                            <button
                                                onClick={() => setModelFilter('all')}
                                                className="hover:text-pink-900 dark:hover:text-pink-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                    {managedByFilter !== 'all' && (
                                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            Managed By: {managedByFilter === 'unassigned' ? 'Unassigned' : (availableUsers.find(u => String(u.id) === managedByFilter)?.name || managedByFilter)}
                                            <button
                                                onClick={() => setManagedByFilter('all')}
                                                className="hover:text-green-900 dark:hover:text-green-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Info Banner */}
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                                <div className="flex items-start gap-2">
                                    <Info className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <div className="text-xs text-blue-800 dark:text-blue-300">
                                        <p className="font-semibold">Advanced Filters</p>
                                        <p className="mt-1">
                                            • Location: {currentBranch?.id === 'all' ? (
                                                <>Shows locations from all branches</>
                                            ) : (
                                                <>Shows locations within <strong>{currentBranch?.name || 'current branch'}</strong> only</>
                                            )}
                                        </p>
                                        <p>• Brand & Model: Loaded from database configuration</p>
                                        <p>• Select brand to filter available models</p>
                                    </div>
                                </div>
                            </div>
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
                            {searchQuery || statusFilter !== 'all' || selectedCategory !== 'all' || locationFilter !== 'all' || brandFilter !== 'all' || modelFilter !== 'all' || managedByFilter !== 'all'
                                ? t('devices.tryAdjustingFilters')
                                : t('devices.noDevicesConfigured')}
                        </p>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && sortedDevices.length > 0 && (
                    <div>
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                {selectedCategory !== 'all' && (() => {
                                    const category = categories.find(c => c.id === selectedCategory);
                                    if (category) {
                                        const Icon = getDeviceCategoryIcon(selectedCategory);
                                        return (
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                                <Icon className="size-5 text-white" />
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                {selectedCategory === 'all' && (
                                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                        <Network className="size-5 text-white" />
                                    </div>
                                )}
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {categories.find(c => c.id === selectedCategory)?.name || 'All Devices'}
                                </h2>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} on this page
                                {totalItems > 0 && (
                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                        (Total: {totalItems} device{totalItems !== 1 ? 's' : ''} matching filters across all pages)
                                    </span>
                                )}
                            </p>
                            {/* View options */}
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={viewOptions.tiny}
                                        onChange={e => setViewOptions(v => ({ ...v, tiny: e.target.checked }))}
                                    />
                                    Smallest
                                </label>
                                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={viewOptions.dense}
                                        onChange={e => setViewOptions(v => ({ ...v, dense: e.target.checked }))}
                                    />
                                    Dense
                                </label>
                                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={viewOptions.showName}
                                        onChange={e => setViewOptions(v => ({ ...v, showName: e.target.checked }))}
                                    />
                                    Name
                                </label>
                                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={viewOptions.showIp}
                                        onChange={e => setViewOptions(v => ({ ...v, showIp: e.target.checked }))}
                                    />
                                    IP
                                </label>
                                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={viewOptions.showStatus}
                                        onChange={e => setViewOptions(v => ({ ...v, showStatus: e.target.checked }))}
                                    />
                                    Status
                                </label>
                            </div>
                        </div>
                        {/*
                          Group devices by location and display with location name on top left, devices below
                        */}
                        {(() => {
                            // Group devices by location
                            const devicesByLocation = filteredDevices.reduce((acc, device) => {
                                // Handle different location formats: string, location_name, or location object
                                const locationName = (device as any).location_name || 
                                                    (typeof device.location === 'string' ? device.location : null) ||
                                                    ((device as any).location?.name) || 
                                                    'No Location';
                                if (!acc[locationName]) {
                                    acc[locationName] = [];
                                }
                                acc[locationName].push(device);
                                return acc;
                            }, {} as Record<string, typeof filteredDevices>);

                            const locations = Object.keys(devicesByLocation).sort();

                            return (
                                <div className="space-y-6">
                                    {locations.map((locationName) => (
                                        <div key={locationName} className="space-y-2">
                                            {/* Location header - minimalistic */}
                                            <div>
                                                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {locationName}
                                                </h3>
                                                <div className="mt-1 border-b border-slate-200 dark:border-slate-700"></div>
                                            </div>
                                            {/* Devices grid for this location */}
                                            <div
                                                className={`grid ${
                                                    viewOptions.tiny
                                                        ? 'grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24 gap-1'
                                                        : viewOptions.dense
                                                            ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-1.5'
                                                            : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-10 gap-3'
                                                }`}
                                            >
                                                {devicesByLocation[locationName].map((device) => (
                                                    <div
                                                        key={device.id}
                                                        className={`group cursor-pointer ${viewOptions.tiny ? 'rounded sm:rounded' : 'rounded-md'} border border-transparent bg-white ${viewOptions.tiny ? 'shadow-none' : 'shadow'} ${viewOptions.tiny ? '' : 'hover:shadow-lg'} transition-all ${viewOptions.tiny ? '' : 'hover:scale-105'} dark:bg-slate-800 ${viewOptions.tiny ? 'p-0.5' : viewOptions.dense ? 'p-1.5' : 'p-2.5'} overflow-hidden`}
                                                        onClick={() => {
                                                            setSelectedDevice(device as Device);
                                                            // Fetch full details (including additional managers) after opening
                                                            loadDeviceDetails((device as Device).id);
                                                        }}
                                                    >
                                                        <div className="flex flex-col items-center text-center w-full min-w-0">
                                                            <div
                                                                className={`${viewOptions.tiny ? 'mb-0' : 'mb-0.5'} ${viewOptions.tiny ? 'rounded' : 'rounded-md'} border border-transparent ${viewOptions.tiny ? 'p-0.5' : viewOptions.dense ? 'p-1' : 'p-1.5'} transition-transform ${viewOptions.tiny ? '' : 'group-hover:scale-110'} ${getStatusBg(device.status as DeviceStatus)} flex-shrink-0`}
                                                            >
                                                                {(() => {
                                                                    const Icon = getDeviceCategoryIcon(device.category || '');
                                                                    return <Icon className={`${viewOptions.tiny ? 'size-3' : viewOptions.dense ? 'size-3' : 'size-4'} ${getStatusColor(device.status as DeviceStatus)}`} />;
                                                                })()}
                                                            </div>
                                                            {viewOptions.showName && (
                                                                <h3 className={`${viewOptions.tiny ? 'mt-0.5 text-[9px]' : 'mb-0 text-[10px]'} font-medium text-slate-900 dark:text-slate-200 line-clamp-1 w-full min-w-0 px-0.5 overflow-hidden text-ellipsis`}>
                                                                    {device.name}
                                                                </h3>
                                                            )}
                                                            {!viewOptions.tiny && viewOptions.showIp && (
                                                                <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 w-full min-w-0 px-0.5 overflow-hidden text-ellipsis">
                                                                    {device.ip_address}
                                                                </div>
                                                            )}
                                                            {!viewOptions.tiny && viewOptions.showStatus && (
                                                                <div className="mt-0.5 text-[10px] w-full min-w-0 px-0.5">
                                                                    <span className={`rounded px-1.5 py-0.5 ${getStatusBg(device.status as DeviceStatus)} ${getStatusColor(device.status as DeviceStatus)} inline-block line-clamp-1 overflow-hidden text-ellipsis`}>
                                                                        {getStatusLabel(device.status as DeviceStatus)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                        
                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onPerPageChange={setPerPage}
                        />
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'list' && sortedDevices.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800 overflow-hidden">
                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                            <div className="flex items-center gap-3">
                                {selectedCategory !== 'all' && (() => {
                                    const Icon = getDeviceCategoryIcon(selectedCategory);
                                    return (
                                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                                            <Icon className="size-6 text-white" />
                                        </div>
                                    );
                                })()}
                                {selectedCategory === 'all' && (
                                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                                        <Network className="size-6 text-white" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {categories.find(c => c.id === selectedCategory)?.name || 'All Devices'}
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Showing {sortedDevices.length} device{sortedDevices.length !== 1 ? 's' : ''} on this page
                                        {totalItems > 0 && (
                                            <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                (Total: {totalItems} device{totalItems !== 1 ? 's' : ''} matching filters across all pages)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full min-w-[800px] sm:min-w-0">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th 
                                            className="px-3 sm:px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                                            className="px-3 sm:px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                                            className="px-3 sm:px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                                            className="px-3 sm:px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                                        <th className="px-3 sm:px-6 py-3 text-left">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Last Ping
                                            </div>
                                        </th>
                                        <th 
                                            className="px-3 sm:px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                                            className="px-3 sm:px-6 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => handleSort('brand')}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Brand/Model
                                                {sortField === 'brand' ? (
                                                    sortOrder === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                                                ) : (
                                                    <ArrowUpDown className="size-4 opacity-30" />
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                                    {sortedDevices.map((device) => (
                                        <tr
                                            key={device.id}
                                            className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                            onClick={() => {
                                                setSelectedDevice(device as Device);
                                                loadDeviceDetails((device as Device).id);
                                            }}
                                        >
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-lg border p-2 ${getStatusBg(device.status as DeviceStatus)}`}>
                                                        {(() => {
                                                            const Icon = getDeviceCategoryIcon(device.category || '');
                                                            return <Icon className={`size-4 ${getStatusColor(device.status as DeviceStatus)}`} />;
                                                        })()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {device.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                    {device.ip_address}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <TrendingUp className="size-4" />
                                                    {formatUptimeDuration(device.uptime_minutes)}
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBg(device.status as DeviceStatus)} ${getStatusColor(device.status as DeviceStatus)}`}>
                                                    {getStatusIcon(device.status as DeviceStatus)}
                                                    {getStatusLabel(device.status as DeviceStatus)}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {device.last_ping 
                                                        ? new Date(device.last_ping).toLocaleString()
                                                        : 'Never'}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                {device.latitude && device.longitude ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const params = new URLSearchParams();
                                                            if (device.location_id) params.set('location_id', String(device.location_id));
                                                            params.set('deviceId', String(device.id));
                                                            router.visit(`/monitor/plan?${params.toString()}`);
                                                        }}
                                                        className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-2 py-1 text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                        title="Open floor plan"
                                                    >
                                                        <MapPin className="size-3.5" />
                                                        <span className="text-xs font-medium">{device.location}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {device.location}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4">
                                                {(device.brand && device.model) ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {device.brand}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {device.model}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-600">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onPerPageChange={setPerPage}
                        />
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
                                        {(() => {
                                            const Icon = getDeviceCategoryIcon(selectedDevice.category || '');
                                            return <Icon className={`size-6 ${getStatusColor(selectedDevice.status)}`} />;
                                        })()}
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
                                <div className="flex items-center gap-2">
                                    {/* Ping Device Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            pingSingleDevice(selectedDevice.id);
                                        }}
                                        disabled={pingingDeviceId === selectedDevice.id}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Ping this device"
                                    >
                                        <RefreshCw className={`size-4 ${pingingDeviceId === selectedDevice.id ? 'animate-spin' : ''}`} />
                                        <span>{pingingDeviceId === selectedDevice.id ? 'Pinging...' : 'Ping Device'}</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedDevice(null)}
                                        className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
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
                                            <TrendingUp className="size-4" />
                                            <span className="text-lg font-semibold">{formatUptimeDuration(selectedDevice.uptime_minutes)}</span>
                                        </div>
                                    </div>

                                    {/* Response Time */}
                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            Response Time
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Zap className="size-4" />
                                            <span className="text-lg font-semibold">
                                                {selectedDevice.response_time ? `${selectedDevice.response_time}ms` : 'N/A'}
                                            </span>
                                            {selectedDevice.response_time && selectedDevice.response_time > 100 && (
                                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    High
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {selectedDevice.status === 'offline' && (
                                        <>
                                            {/* Offline Duration */}
                                            {selectedDevice.offline_duration_minutes !== undefined && selectedDevice.offline_duration_minutes > 0 && (
                                                <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
                                                    <h3 className="mb-2 text-sm font-semibold text-orange-900 dark:text-orange-300">
                                                        Offline Duration
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="size-4 text-orange-600 dark:text-orange-400" />
                                                        <span className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                                                            {selectedDevice.offline_duration_minutes} minute{selectedDevice.offline_duration_minutes !== 1 ? 's' : ''}
                                                        </span>
                                                        {selectedDevice.offline_duration_minutes >= 2 && (
                                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                Alert Triggered
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedDevice.offline_since && (
                                                        <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                            Offline since: {new Date(selectedDevice.offline_since).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

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
                                                                        {formatUptimeDuration(selectedDevice.uptime_minutes)}
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
                                                <span className="text-slate-600 dark:text-slate-400">Serial Number:</span>
                                                <span className="font-medium text-slate-900 dark:text-white font-mono">
                                                    {selectedDevice.serial_number || '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-slate-600 dark:text-slate-400">Managed By:</span>
                                                <div className="text-right">
                                                    {selectedDevice.managed_by_user ? (
                                                        <>
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {selectedDevice.managed_by_user.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {selectedDevice.managed_by_user.email}
                                                            </p>
                                                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                selectedDevice.managed_by_user.role === 'admin' 
                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                                {selectedDevice.managed_by_user.role}
                                                            </span>
                                                            {Array.isArray(selectedDevice.managed_by_users) && selectedDevice.managed_by_users.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {selectedDevice.managed_by_users.map((u) => (
                                                                        <div key={u.id}>
                                                                            <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                                                                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                                u.role === 'admin' 
                                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                            }`}>
                                                                                {u.role}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-slate-400 dark:text-slate-600">Not assigned</span>
                                                            {Array.isArray(selectedDevice.managed_by_users) && selectedDevice.managed_by_users.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {selectedDevice.managed_by_users.map((u) => (
                                                                        <div key={u.id}>
                                                                            <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                                                                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                                u.role === 'admin' 
                                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                            }`}>
                                                                                {u.role}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Response Time:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.response_time ? `${selectedDevice.response_time}ms` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Last Ping:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.last_ping 
                                                        ? new Date(selectedDevice.last_ping).toLocaleString()
                                                        : 'Never'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Last Changed:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.updated_at 
                                                        ? new Date(selectedDevice.updated_at).toLocaleString()
                                                        : 'Never'}
                                                </span>
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
                                                <span className="text-slate-600 dark:text-slate-400">Brand/Model:</span>
                                                {(selectedDevice.brand && selectedDevice.model) ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {selectedDevice.brand}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {selectedDevice.model}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-600">-</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Device ID:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {selectedDevice.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            Comments
                                        </h3>
                                        <DeviceComments deviceId={selectedDevice.id} />
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

// Device Comments Component (Read-only for device details)
function DeviceComments({ deviceId }: { deviceId: number }) {
    const [comments, setComments] = useState<DeviceComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/devices/${deviceId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    if (isLoading) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Loading comments...
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No comments yet for this device.
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-700 dark:border-slate-600"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                comment.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                comment.type === 'issue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                comment.type === 'note' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                                {comment.type}
                            </span>
                            <span className="font-medium text-sm text-slate-900 dark:text-white">
                                {comment.author}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(comment.created_at).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {comment.comment}
                    </p>
                </div>
            ))}
        </div>
    );
}

// Pagination Component
function Pagination({ 
    currentPage, 
    totalPages, 
    totalItems,
    perPage,
    onPageChange,
    onPerPageChange 
}: { 
    currentPage: number; 
    totalPages: number; 
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}) {
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);
    
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push('...');
            }
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            
            pages.push(totalPages);
        }
        
        return pages;
    };
    
    if (totalPages <= 1) return null;
    
    return (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> results
                    </p>
                    <select
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    >
                        <option value={300}>300 per page</option>
                        <option value={500}>500 per page</option>
                        <option value={800}>800 per page</option>
                        <option value={1000}>1000 per page</option>
                    </select>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-600 dark:hover:bg-slate-700"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="size-5" />
                        </button>
                        {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 dark:text-slate-300 dark:ring-slate-600">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page as number)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 dark:ring-slate-600 ${
                                        currentPage === page
                                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                            : 'text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-600 dark:hover:bg-slate-700"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="size-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}