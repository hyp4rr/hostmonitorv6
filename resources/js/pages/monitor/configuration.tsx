import MonitorLayout from '@/layouts/monitor-layout';
import {
    AlertTriangle,
    Edit,
    Eye,
    Plus,
    Save,
    Server,
    Trash2,
    User,
    X,
    Building2,
    MapPin,
    History,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    RefreshCw,
    Search,
    Check,
    MessageCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { Head, router, usePage } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { CurrentBranch } from '@/types/branch';
import { PageProps } from '@/types';

// Helper function to format category display
const formatCategory = (category: string): string => {
    const formatted: Record<string, string> = {
        'tas': 'TAS',
        'cctv': 'CCTV',
        'wifi': 'WiFi',
        'switches': 'Switches',
        'servers': 'Servers',
    };
    return formatted[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
};

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

interface Device {
    id: number;
    branch_id: number;
    branch?: {
        id: number;
        name: string;
    };
    location_id?: number;
    location?: {
        id: number;
        name: string;
    };
    location_name?: string;
    hardware_detail_id?: number;
    hardware_detail?: {
        id: number;
        brand: string;
        model: string;
    };
    name: string;
    ip_address: string;
    mac_address?: string;
    barcode: string;
    managed_by?: number;
    managed_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    serial_number?: string;
    type: string;
    category: string;
    status: string;
    uptime_percentage: number;
    uptime_minutes: number;
    is_active: boolean;
    response_time?: number;
    last_check?: string;
    created_at?: string;
    offline_reason?: string;
    offline_acknowledged_by?: string;
    offline_acknowledged_at?: string;
    offline_since?: string;
    offline_duration_minutes?: number;
    offline_alert_sent?: boolean;
    latitude?: number;
    longitude?: number;
}

interface Alert {
    id: number;
    device_id: number;
    device?: { name: string };
    type: string;
    severity: string;
    category: string;
    title: string;
    message: string;
    status: string;
    acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: string;
    reason?: string;
    resolved: boolean;
    resolved_at?: string;
    triggered_at: string;
}

interface Location {
    id: number;
    branch_id: number;
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

interface Branch {
    id: number;
    name: string;
    code: string;
    description?: string;
    address?: string;
    is_active: boolean;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    created_at: string;
}

interface Brand {
    id: number;
    name: string;
    description?: string;
}

interface Model {
    id: number;
    brand_id: number;
    brand?: {
        id: number;
        name: string;
    };
    name: string;
    description?: string;
}

type CRUDEntity = 'branches' | 'devices' | 'alerts' | 'locations' | 'users' | 'brands' | 'models' | 'history';

interface ActivityLog {
    id: number;
    user: string;
    action: string;
    entity_type: string;
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
    ip_address?: string;
}

interface DeviceComment {
    id: number;
    device_id: number;
    comment: string;
    author?: string;
    type: 'general' | 'maintenance' | 'issue' | 'note';
    created_at: string;
    updated_at: string;
    device?: {
        id: number;
        name: string;
        ip_address: string;
    };
}

export default function Configuration() {
    const { t } = useTranslation();
    const { currentBranch } = usePage<PageProps>().props;
    
    // CRUD state
    const [selectedEntity, setSelectedEntity] = useState<CRUDEntity>('devices');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'acknowledge'>('create');
    const [selectedItem, setSelectedItem] = useState<Device | Alert | Location | Branch | UserData | Brand | Model | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewDevice, setViewDevice] = useState<Device | null>(null);

    // Data state
    const [devices, setDevices] = useState<Device[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Comments state
    const [comments, setComments] = useState<DeviceComment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedDeviceForComments, setSelectedDeviceForComments] = useState<Device | null>(null);
    
    // Selection state for bulk operations
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter and search state
    const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
    const [deviceStatusFilter, setDeviceStatusFilter] = useState<string>('all');
    const [deviceCategoryFilter, setDeviceCategoryFilter] = useState<string>('all');
    const [deviceActiveFilter, setDeviceActiveFilter] = useState<string>('all'); // all, active, inactive
    const [alertSearchTerm, setAlertSearchTerm] = useState('');
    const [alertStatusFilter, setAlertStatusFilter] = useState<string>('all');
    const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
    const [locationSearchTerm, setLocationSearchTerm] = useState('');
    const [branchSearchTerm, setBranchSearchTerm] = useState('');
    const [branchActiveFilter, setBranchActiveFilter] = useState<string>('all');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [modelSearchTerm, setModelSearchTerm] = useState('');

    // Sorting state
    const [deviceSortField, setDeviceSortField] = useState<string>('name');
    const [deviceSortDirection, setDeviceSortDirection] = useState<'asc' | 'desc'>('asc');
    const [alertSortField, setAlertSortField] = useState<string>('triggered_at');
    const [alertSortDirection, setAlertSortDirection] = useState<'asc' | 'desc'>('desc');

    // Fetch data when entity changes
    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when entity changes
        fetchData();
        setSelectedIds([]); // Clear selection when changing entity
    }, [selectedEntity, currentBranch?.id]);
    
    // Fetch data when page changes
    useEffect(() => {
        fetchData();
    }, [currentPage, perPage]);
    
    // Fetch data when device filters or sorting change (for backend filtering/sorting)
    useEffect(() => {
        if (selectedEntity === 'devices') {
            setCurrentPage(1); // Reset to page 1 when filters or sorting change
            fetchData();
        }
    }, [deviceSearchTerm, deviceStatusFilter, deviceCategoryFilter, deviceActiveFilter, deviceSortField, deviceSortDirection]);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [selectedEntity, currentBranch?.id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const entityMap: Record<CRUDEntity, string> = {
                branches: '/api/branches',
                devices: '/api/devices',
                alerts: '/api/alerts',
                locations: '/api/locations',
                users: '/api/users',
                brands: '/api/brands',
                models: '/api/models',
                history: '/api/activity-logs',
            };

            let endpoint = entityMap[selectedEntity];
            if (!endpoint) {
                setIsLoading(false);
                return;
            }

            // Add branch filter and pagination for devices, alerts, locations, and history
            const params = new URLSearchParams();
            
            if (currentBranch?.id && ['devices', 'alerts', 'locations', 'history'].includes(selectedEntity)) {
                params.append('branch_id', currentBranch.id.toString());
            }
            
            // Add pagination params for entities that support it
            if (['devices', 'alerts', 'locations', 'users'].includes(selectedEntity)) {
                params.append('page', currentPage.toString());
                params.append('per_page', perPage.toString());
            }
            
            // For devices in configuration panel, include inactive devices and pass filters
            if (selectedEntity === 'devices') {
                params.append('include_inactive', 'true');
                
                // Pass search filter to backend
                if (deviceSearchTerm) {
                    params.append('search', deviceSearchTerm);
                }
                
                // Pass category filter to backend
                if (deviceCategoryFilter !== 'all') {
                    params.append('category', deviceCategoryFilter);
                }
                
                // Pass status filter to backend
                if (deviceStatusFilter !== 'all') {
                    params.append('status', deviceStatusFilter);
                }
                
                // Pass active filter to backend
                if (deviceActiveFilter !== 'all') {
                    params.append('active_filter', deviceActiveFilter);
                }
                
                // Pass sort parameters to backend
                params.append('sort_by', deviceSortField);
                params.append('sort_order', deviceSortDirection);
            }
            
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }

            console.log('Fetching from:', endpoint);

            const response = await fetch(endpoint, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                },
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const responseData = await response.json();
                console.log('Fetched data:', responseData);
                
                // Check if response has pagination data
                const hasPagination = responseData.pagination !== undefined;
                const data = hasPagination ? responseData.data : responseData;
                
                // Update pagination state if available
                if (hasPagination) {
                    setTotalItems(responseData.pagination.total);
                    setTotalPages(responseData.pagination.last_page);
                    setCurrentPage(responseData.pagination.current_page);
                }
                
                switch (selectedEntity) {
                    case 'branches':
                        console.log('Setting branches:', data);
                        setBranches(data);
                        break;
                    case 'devices':
                        setDevices(data);
                        break;
                    case 'alerts':
                        setAlerts(data);
                        break;
                    case 'locations':
                        setLocations(data);
                        break;
                    case 'users':
                        setUsers(data);
                        break;
                    case 'brands':
                        setBrands(data);
                        break;
                    case 'models':
                        setModels(data);
                        break;
                    case 'history':
                        setActivityHistory(data);
                        break;
                }
            } else {
                console.error('Failed to fetch:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to get CSRF token
    const getCsrfToken = async () => {
        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'same-origin',
            });
            
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!token) {
                console.error('CSRF token not found after refresh');
                return '';
            }
            return token;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
            return '';
        }
    };

    // CRUD operations
    const handleCreate = () => {
        setModalMode('create');
        setSelectedItem(null);
        setShowModal(true);
    };

    const handleEdit = (item: Device | Alert | Location | Branch | UserData | Brand | Model) => {
        setModalMode('edit');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleDelete = (item: Device | Alert | Location | Branch | UserData | Brand | Model) => {
        setModalMode('delete');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleAcknowledgeOffline = (device: Device) => {
        setModalMode('acknowledge');
        setSelectedItem(device);
        setShowModal(true);
    };

    const handleViewDevice = (device: Device) => {
        setViewDevice(device);
        setShowViewModal(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const entityMap: Record<CRUDEntity, string> = {
                branches: '/api/branches',
                devices: '/api/devices',
                alerts: '/api/alerts',
                locations: '/api/locations',
                users: '/api/users',
                brands: '/api/brands',
                models: '/api/models',
            };

            const baseUrl = entityMap[selectedEntity];
            const url = modalMode === 'create' 
                ? baseUrl 
                : `${baseUrl}/${selectedItem?.id}`;
            
            const formData = new FormData(document.querySelector('form') as HTMLFormElement);
            const data: Record<string, any> = {};
            
            // Convert FormData to object, handling checkboxes properly
            formData.forEach((value, key) => {
                // Skip empty values for optional foreign keys
                if (key === 'location_id' && value === '') {
                    return;
                }
                if (key === 'hardware_detail_id' && value === '') {
                    return;
                }
                data[key] = value;
            });
            
            // Convert boolean checkboxes - must check if key exists in form
            const form = document.querySelector('form') as HTMLFormElement;
            const checkboxFields = ['is_active', 'acknowledged', 'resolved'];
            
            checkboxFields.forEach(field => {
                const checkbox = form.querySelector(`input[name="${field}"]`) as HTMLInputElement;
                if (checkbox) {
                    data[field] = checkbox.checked;
                }
            });
            
            console.log('Saving data:', data); // Debug log
            
            const csrfToken = await getCsrfToken();

            // For updates, use POST with _method override (Laravel standard)
            const method = modalMode === 'create' ? 'POST' : 'POST';
            const requestData = modalMode === 'create' 
                ? data 
                : { ...data, _method: 'PUT' };

            console.log('Request data:', requestData); // Debug log

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                await fetchData();
                setShowModal(false);
                setSelectedItem(null);
            } else {
                const errorData = await response.json();
                console.error('Save error:', errorData); // Debug log
                alert(`Failed to save: ${errorData.error || errorData.message || 'Unknown error'}\n${JSON.stringify(errorData.messages || {}, null, 2)}`);
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            const entityMap: Record<CRUDEntity, string> = {
                branches: '/api/branches',
                devices: '/api/devices',
                alerts: '/api/alerts',
                locations: '/api/locations',
                users: '/api/users',
                brands: '/api/brands',
                models: '/api/models',
            };

            const url = `${entityMap[selectedEntity]}/${selectedItem?.id}`;
            
            const csrfToken = await getCsrfToken();

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                await fetchData();
                setShowModal(false);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            alert('Please select items to delete');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected item(s)?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const entityMap: Record<CRUDEntity, string> = {
                branches: '/api/branches',
                devices: '/api/devices',
                alerts: '/api/alerts',
                locations: '/api/locations',
                users: '/api/users',
                brands: '/api/brands',
                models: '/api/models',
                history: '/api/activity-logs',
            };

            const endpoint = entityMap[selectedEntity];
            if (!endpoint) return;

            // Delete each selected item
            const deletePromises = selectedIds.map(id =>
                fetch(`${endpoint}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                })
            );

            await Promise.all(deletePromises);
            
            // Refresh data and clear selection
            await fetchData();
            setSelectedIds([]);
            alert(`Successfully deleted ${selectedIds.length} item(s)`);
        } catch (error) {
            console.error('Error bulk deleting:', error);
            alert('Failed to delete some items. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Toggle selection for a single item
    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    // Toggle select all
    const toggleSelectAll = () => {
        const currentData = getCurrentData();
        if (selectedIds.length === currentData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentData.map((item: any) => item.id));
        }
    };

    // Filter other entities
    const filteredDevices = devices.filter(device => {
        const matchesSearch = deviceSearchTerm === '' || 
            device.name.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
            device.ip_address.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
            (device.mac_address && device.mac_address.toLowerCase().includes(deviceSearchTerm.toLowerCase())) ||
            (device.barcode && device.barcode.toLowerCase().includes(deviceSearchTerm.toLowerCase())) ||
            (device.serial_number && device.serial_number.toLowerCase().includes(deviceSearchTerm.toLowerCase()));
        
        const matchesStatus = deviceStatusFilter === 'all' || 
            (deviceStatusFilter === 'online' && device.status === 'online') ||
            (deviceStatusFilter === 'warning' && device.status === 'warning') ||
            (deviceStatusFilter === 'offline' && device.status === 'offline' && !device.offline_acknowledged) ||
            (deviceStatusFilter === 'offline_ack' && device.status === 'offline' && device.offline_acknowledged);
        
        const matchesCategory = deviceCategoryFilter === 'all' || device.type === deviceCategoryFilter;
        
        const matchesActive = deviceActiveFilter === 'all' || 
            (deviceActiveFilter === 'active' && device.is_active) ||
            (deviceActiveFilter === 'inactive' && !device.is_active);
        
        return matchesSearch && matchesStatus && matchesCategory && matchesActive;
    });

    const filteredLocations = locations.filter(location => 
        locationSearchTerm === '' || 
        location.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(locationSearchTerm.toLowerCase()))
    );
    
    const filteredBranches = branches.filter(branch => {
        const matchesSearch = branchSearchTerm === '' || 
            branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
            branch.code.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
            (branch.description && branch.description.toLowerCase().includes(branchSearchTerm.toLowerCase()));
        const matchesActive = branchActiveFilter === 'all' || 
            (branchActiveFilter === 'active' && branch.is_active) ||
            (branchActiveFilter === 'inactive' && !branch.is_active);
        return matchesSearch && matchesActive;
    });
    
    const filteredUsers = users.filter(user => 
        userSearchTerm === '' || 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.role && user.role.toLowerCase().includes(userSearchTerm.toLowerCase()))
    );
    
    const filteredBrands = brands.filter(brand => 
        brandSearchTerm === '' || 
        brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(brandSearchTerm.toLowerCase()))
    );
    
    const filteredModels = models.filter(model => 
        modelSearchTerm === '' || 
        model.name.toLowerCase().includes(modelSearchTerm.toLowerCase()) ||
        (model.description && model.description.toLowerCase().includes(modelSearchTerm.toLowerCase())) ||
        (model.brand?.name && model.brand.name.toLowerCase().includes(modelSearchTerm.toLowerCase()))
    );

    // Get current data based on selected entity
    const getCurrentData = () => {
        switch (selectedEntity) {
            case 'branches': return filteredBranches;
            case 'devices': return filteredDevices;
            case 'alerts': return filteredAlerts;
            case 'locations': return filteredLocations;
            case 'users': return filteredUsers;
            case 'brands': return filteredBrands;
            case 'models': return filteredModels;
            case 'history': return activityHistory;
            default: return [];
        }
    };

    // Comment management functions
    const fetchComments = async (deviceId: number) => {
        setIsLoadingComments(true);
        try {
            const response = await fetch(`/devices/${deviceId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const openCommentsModal = (device: Device) => {
        setSelectedDeviceForComments(device);
        setShowCommentsModal(true);
        fetchComments(device.id);
    };

    const closeCommentsModal = () => {
        setShowCommentsModal(false);
        setSelectedDeviceForComments(null);
        setComments([]);
    };

    const deleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        
        try {
            const response = await fetch(`/comments/${commentId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                setComments(prev => prev.filter(comment => comment.id !== commentId));
            } else {
                const errorData = await response.json();
                alert(`Failed to delete comment: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Network error while deleting comment');
        }
    };

    // Add error logging
    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            console.error('Configuration page error:', error);
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    // Fetch users when modal opens for devices (so managed_by dropdown is populated)
    useEffect(() => {
        if (showModal && selectedEntity === 'devices' && users.length === 0) {
            fetch('/api/users', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
                .then(response => response.json())
                .then(data => {
                    setUsers(data);
                })
                .catch(error => console.error('Error fetching users:', error));
        }
    }, [showModal, selectedEntity]);

    // Note: For devices, filtering and sorting are now done on the backend
    // The devices array already contains filtered and sorted results for the current page
    // Frontend filtering is removed for devices to enable global filtering across all pages

    // Filter and sort alerts
    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alertSearchTerm === '' || 
            alert.title.toLowerCase().includes(alertSearchTerm.toLowerCase()) ||
            alert.message.toLowerCase().includes(alertSearchTerm.toLowerCase()) ||
            (alert.device?.name && alert.device.name.toLowerCase().includes(alertSearchTerm.toLowerCase()));
        
        const matchesStatus = alertStatusFilter === 'all' || alert.status === alertStatusFilter;
        const matchesSeverity = alertSeverityFilter === 'all' || alert.severity === alertSeverityFilter;
        
        return matchesSearch && matchesStatus && matchesSeverity;
    }).sort((a, b) => {
        let aVal = a[alertSortField as keyof Alert];
        let bVal = b[alertSortField as keyof Alert];
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        // Convert to string for comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (alertSortDirection === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });

    // Main configuration interface
    return (
        <MonitorLayout title={t('config.title')}>
            <div className="space-y-6">
                {/* Branch Info Banner */}
                {currentBranch?.id && (
                    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                <Server className="size-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    Managing: {currentBranch.name}
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {currentBranch.description} • Branch Code: {currentBranch.code}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('config.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('config.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Entity selector tabs */}
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200/50 bg-white p-2 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    {(['branches', 'devices', 'alerts', 'locations', 'brands', 'models', 'users', 'history'] as CRUDEntity[]).map((entity) => (
                        <button
                            key={entity}
                            onClick={() => setSelectedEntity(entity)}
                            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                selectedEntity === entity
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            {entity.charAt(0).toUpperCase() + entity.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content area */}
                <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
                                <Server className="size-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Manage {selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1)}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Create, edit, and manage your {selectedEntity}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchData()}
                                disabled={isLoading}
                                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                title="Refresh data"
                            >
                                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            {selectedEntity !== 'history' && (
                                <>
                                    <button
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                        title={selectedIds.length === getCurrentData().length ? 'Deselect All' : 'Select All'}
                                    >
                                        <Check className="size-4" />
                                        {selectedIds.length === getCurrentData().length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    {selectedIds.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={isDeleting}
                                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                                            title={`Delete ${selectedIds.length} selected item(s)`}
                                        >
                                            <Trash2 className="size-4" />
                                            Delete Selected ({selectedIds.length})
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105"
                                    >
                                        <Plus className="size-4" />
                                        Add New
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
                                <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                            </div>
                        ) : (
                            <>
                                {selectedEntity === 'branches' && (
                                    <>
                                        {/* Branch Filters */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, code, or description..."
                                                        value={branchSearchTerm}
                                                        onChange={(e) => setBranchSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    <select
                                                        value={branchActiveFilter}
                                                        onChange={(e) => setBranchActiveFilter(e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    >
                                                        <option value="all">All Branches</option>
                                                        <option value="active">Active Only</option>
                                                        <option value="inactive">Inactive Only</option>
                                                    </select>
                                                    
                                                    {(branchSearchTerm || branchActiveFilter !== 'all') && (
                                                        <button
                                                            onClick={() => {
                                                                setBranchSearchTerm('');
                                                                setBranchActiveFilter('all');
                                                            }}
                                                            className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                        >
                                                            <X className="size-4" />
                                                            Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {filteredBranches.length} of {branches.length} branch(es)
                                                {filteredBranches.length !== branches.length && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        ({branches.length - filteredBranches.length} hidden by filters)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <BranchesTable
                                            branches={filteredBranches}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            selectedIds={selectedIds}
                                            onToggleSelection={toggleSelection}
                                        />
                                    </>
                                )}
                                {selectedEntity === 'devices' && (
                                    <>
                                        {/* Device Filters - Enhanced */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                {/* Search Bar */}
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, IP, MAC, barcode, or serial number..."
                                                        value={deviceSearchTerm}
                                                        onChange={(e) => setDeviceSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                {/* Filter Buttons */}
                                                <div className="flex flex-wrap gap-2">
                                                    <select
                                                        value={deviceCategoryFilter}
                                                        onChange={(e) => setDeviceCategoryFilter(e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    >
                                                        <option value="all">All Categories</option>
                                                        <option value="switches">Switches</option>
                                                        <option value="servers">Servers</option>
                                                        <option value="wifi">WiFi</option>
                                                        <option value="tas">TAS</option>
                                                        <option value="cctv">CCTV</option>
                                                    </select>
                                                    
                                                    <select
                                                        value={deviceStatusFilter}
                                                        onChange={(e) => setDeviceStatusFilter(e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    >
                                                        <option value="all">All Status</option>
                                                        <option value="online">Online</option>
                                                        <option value="warning">Warning</option>
                                                        <option value="offline">Offline</option>
                                                        <option value="offline_ack">Acknowledged</option>
                                                    </select>
                                                    
                                                    <select
                                                        value={deviceActiveFilter}
                                                        onChange={(e) => setDeviceActiveFilter(e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    >
                                                        <option value="all">All Devices</option>
                                                        <option value="active">Active Only</option>
                                                        <option value="inactive">Inactive Only</option>
                                                    </select>
                                                    
                                                    {/* Clear Filters Button */}
                                                    {(deviceSearchTerm || deviceStatusFilter !== 'all' || deviceCategoryFilter !== 'all' || deviceActiveFilter !== 'all') && (
                                                        <button
                                                            onClick={() => {
                                                                setDeviceSearchTerm('');
                                                                setDeviceStatusFilter('all');
                                                                setDeviceCategoryFilter('all');
                                                                setDeviceActiveFilter('all');
                                                            }}
                                                            className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                        >
                                                            <X className="size-4" />
                                                            Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Results Count */}
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {devices.length} device(s) on this page
                                                {totalItems > 0 && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        (Total: {totalItems} device(s) matching filters across all pages)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <DevicesTable
                                            devices={devices}
                                            onView={handleViewDevice}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAcknowledgeOffline={handleAcknowledgeOffline}
                                            onComments={openCommentsModal}
                                            sortField={deviceSortField}
                                            sortDirection={deviceSortDirection}
                                            onSort={(field) => {
                                                if (deviceSortField === field) {
                                                    setDeviceSortDirection(deviceSortDirection === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setDeviceSortField(field);
                                                    setDeviceSortDirection('asc');
                                                }
                                            }}
                                            selectedIds={selectedIds}
                                            onToggleSelection={toggleSelection}
                                        />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            perPage={perPage}
                                            onPageChange={setCurrentPage}
                                            onPerPageChange={setPerPage}
                                        />
                                    </>
                                )}
                                {selectedEntity === 'alerts' && (
                                    <>
                                        {/* Alert Filters - Enhanced */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by title, message, or device name..."
                                                        value={alertSearchTerm}
                                                        onChange={(e) => setAlertSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    <select
                                                        value={alertSeverityFilter}
                                                        onChange={(e) => setAlertSeverityFilter(e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    >
                                                        <option value="all">All Severities</option>
                                                        <option value="critical">Critical</option>
                                                        <option value="high">High</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="low">Low</option>
                                                    </select>
                                                    
                                                    <select
                                                        value={alertStatusFilter}
                                                        onChange={(e) => setAlertStatusFilter(e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    >
                                                        <option value="all">All Status</option>
                                                        <option value="active">Active</option>
                                                        <option value="acknowledged">Acknowledged</option>
                                                        <option value="resolved">Resolved</option>
                                                    </select>
                                                    
                                                    {(alertSearchTerm || alertStatusFilter !== 'all' || alertSeverityFilter !== 'all') && (
                                                        <button
                                                            onClick={() => {
                                                                setAlertSearchTerm('');
                                                                setAlertStatusFilter('all');
                                                                setAlertSeverityFilter('all');
                                                            }}
                                                            className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                        >
                                                            <X className="size-4" />
                                                            Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {filteredAlerts.length} of {alerts.length} alert(s)
                                                {filteredAlerts.length !== alerts.length && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        ({alerts.length - filteredAlerts.length} hidden by filters)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <AlertsTable
                                            alerts={filteredAlerts}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            sortField={alertSortField}
                                            sortDirection={alertSortDirection}
                                            onSort={(field) => {
                                                if (alertSortField === field) {
                                                    setAlertSortDirection(alertSortDirection === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setAlertSortField(field);
                                                    setAlertSortDirection('asc');
                                                }
                                            }}
                                            selectedIds={selectedIds}
                                            onToggleSelection={toggleSelection}
                                        />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            perPage={perPage}
                                            onPageChange={setCurrentPage}
                                            onPerPageChange={setPerPage}
                                        />
                                    </>
                                )}
                                {selectedEntity === 'locations' && (
                                    <>
                                        {/* Location Filters */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name or description..."
                                                        value={locationSearchTerm}
                                                        onChange={(e) => setLocationSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                {locationSearchTerm && (
                                                    <button
                                                        onClick={() => setLocationSearchTerm('')}
                                                        className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        <X className="size-4" />
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {filteredLocations.length} of {locations.length} location(s)
                                                {filteredLocations.length !== locations.length && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        ({locations.length - filteredLocations.length} hidden by filters)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <LocationsTable
                                            locations={filteredLocations}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            selectedIds={selectedIds}
                                            onToggleSelection={toggleSelection}
                                        />
                                    </>
                                )}
                                {selectedEntity === 'users' && (
                                    <>
                                        {/* User Filters */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, email, or role..."
                                                        value={userSearchTerm}
                                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                {userSearchTerm && (
                                                    <button
                                                        onClick={() => setUserSearchTerm('')}
                                                        className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        <X className="size-4" />
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {filteredUsers.length} of {users.length} user(s)
                                                {filteredUsers.length !== users.length && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        ({users.length - filteredUsers.length} hidden by filters)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <UsersTable
                                            users={filteredUsers}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        selectedIds={selectedIds}
                                        onToggleSelection={toggleSelection}
                                    />
                                    </>
                                )}
                                {selectedEntity === 'brands' && (
                                    <>
                                        {/* Brand Filters */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name or description..."
                                                        value={brandSearchTerm}
                                                        onChange={(e) => setBrandSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                {brandSearchTerm && (
                                                    <button
                                                        onClick={() => setBrandSearchTerm('')}
                                                        className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        <X className="size-4" />
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {filteredBrands.length} of {brands.length} brand(s)
                                                {filteredBrands.length !== brands.length && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        ({brands.length - filteredBrands.length} hidden by filters)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <BrandsTable
                                            brands={filteredBrands}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        selectedIds={selectedIds}
                                        onToggleSelection={toggleSelection}
                                    />
                                    </>
                                )}
                                {selectedEntity === 'models' && (
                                    <>
                                        {/* Model Filters */}
                                        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-slate-800/50">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, description, or brand..."
                                                        value={modelSearchTerm}
                                                        onChange={(e) => setModelSearchTerm(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                                                    />
                                                </div>
                                                
                                                {modelSearchTerm && (
                                                    <button
                                                        onClick={() => setModelSearchTerm('')}
                                                        className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        <X className="size-4" />
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Showing {filteredModels.length} of {models.length} model(s)
                                                {filteredModels.length !== models.length && (
                                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                        ({models.length - filteredModels.length} hidden by filters)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ModelsTable
                                            models={filteredModels}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        selectedIds={selectedIds}
                                        onToggleSelection={toggleSelection}
                                    />
                                    </>
                                )}
                                {selectedEntity === 'history' && (
                                    <HistoryView activities={activityHistory} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Create/Edit/Delete */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl my-8 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {modalMode === 'create' && `Create New ${selectedEntity.slice(0, -1)}`}
                                {modalMode === 'edit' && `Edit ${selectedEntity.slice(0, -1)}`}
                                {modalMode === 'delete' && `Delete ${selectedEntity.slice(0, -1)}`}
                                {modalMode === 'acknowledge' && 'Acknowledge Offline Device'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-6">
                            {modalMode === 'delete' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                                        <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
                                        <p className="text-sm text-red-800 dark:text-red-400">
                                            Are you sure you want to delete this item? This action cannot be undone.
                                        </p>
                                    </div>
                                    {selectedItem && (
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {'title' in selectedItem 
                                                    ? selectedItem.title 
                                                    : 'name' in selectedItem 
                                                    ? selectedItem.name 
                                                    : `ID: ${(selectedItem as { id: number }).id}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : modalMode === 'acknowledge' ? (
                                <AcknowledgeOfflineForm device={selectedItem as Device} />
                            ) : (
                                <EntityForm
                                    entity={selectedEntity}
                                    mode={modalMode}
                                    data={selectedItem}
                                    users={users}
                                />
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isLoading}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            {modalMode === 'delete' ? (
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Trash2 className="size-4" />
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="size-4" />
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Device Modal */}
            {showViewModal && viewDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Device Details
                            </h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Basic Information
                                    </h3>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Device Name
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.name}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            IP Address
                                        </label>
                                        <p className="mt-1 font-mono text-slate-900 dark:text-white">{viewDevice.ip_address}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            MAC Address
                                        </label>
                                        <p className="mt-1 font-mono text-slate-900 dark:text-white">{viewDevice.mac_address || '-'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Barcode
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.barcode}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Serial Number
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.serial_number || '-'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Category
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{formatCategory(viewDevice.category)}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Status
                                        </label>
                                        <p className="mt-1">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                viewDevice.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                viewDevice.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {viewDevice.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Location & Management */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Location & Management
                                    </h3>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Branch
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.branch?.name || '-'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Location
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.location?.name || viewDevice.location_name || '-'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Managed By
                                        </label>
                                        {viewDevice.managed_by_user ? (
                                            <div className="mt-1">
                                                <p className="text-slate-900 dark:text-white">{viewDevice.managed_by_user.name}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{viewDevice.managed_by_user.email}</p>
                                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    viewDevice.managed_by_user.role === 'admin' 
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                    {viewDevice.managed_by_user.role}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-slate-400 dark:text-slate-600">Not assigned</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Hardware
                                        </label>
                                        {viewDevice.hardware_detail ? (
                                            <div className="mt-1">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {viewDevice.hardware_detail.brand}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {viewDevice.hardware_detail.model}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-slate-400 dark:text-slate-600">-</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Uptime
                                        </label>
                                        <p className="mt-1 text-slate-900 dark:text-white">{formatUptimeDuration(viewDevice.uptime_minutes)}</p>
                                    </div>

                                    {viewDevice.response_time && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                Response Time
                                            </label>
                                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.response_time}ms</p>
                                        </div>
                                    )}
                                </div>

                                {/* Comments Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <MessageCircle className="size-5" />
                                        Comments
                                    </h3>
                                    
                                    <DeviceComments deviceId={viewDevice.id} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    handleEdit(viewDevice);
                                }}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Edit Device
                            </button>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Modal */}
            {showCommentsModal && selectedDeviceForComments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl my-8 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageCircle className="size-5" />
                                Comments - {selectedDeviceForComments.name}
                            </h3>
                            <button
                                onClick={closeCommentsModal}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Device Info */}
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedDeviceForComments.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{selectedDeviceForComments.ip_address}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        selectedDeviceForComments.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        selectedDeviceForComments.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {selectedDeviceForComments.status}
                                    </span>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                                {isLoadingComments ? (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        Loading comments...
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        No comments yet. Add the first comment!
                                    </div>
                                ) : (
                                    comments.map((comment) => (
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
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteComment(comment.id)}
                                                        className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                                                        title="Delete comment"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                {comment.comment}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Comment Form */}
                            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                                <CommentForm 
                                    deviceId={selectedDeviceForComments.id}
                                    onCommentAdded={() => fetchComments(selectedDeviceForComments.id)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

// Comment Form Component
function CommentForm({ deviceId, onCommentAdded }: { deviceId: number; onCommentAdded: () => void }) {
    const [comment, setComment] = useState('');
    const [author, setAuthor] = useState('');
    const [type, setType] = useState<'general' | 'maintenance' | 'issue' | 'note'>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/devices/${deviceId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    comment: comment.trim(),
                    author: author.trim() || 'Admin',
                    type: type,
                }),
            });
            
            if (response.ok) {
                setComment('');
                setAuthor('');
                onCommentAdded();
            } else {
                const errorData = await response.json();
                alert(`Failed to add comment: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Network error while adding comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="issue">Issue</option>
                    <option value="note">Note</option>
                </select>
            </div>
            <div className="flex gap-2">
                <textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    rows={3}
                />
                <button
                    type="submit"
                    disabled={!comment.trim() || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit"
                >
                    {isSubmitting ? 'Adding...' : 'Add'}
                </button>
            </div>
        </form>
    );
}

// Devices Table Component
function DevicesTable({
    devices,
    onView,
    onEdit,
    onDelete,
    onAcknowledgeOffline,
    onComments,
    sortField,
    sortDirection,
    onSort,
    selectedIds,
    onToggleSelection,
}: {
    devices: Device[];
    onView: (device: Device) => void;
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
    onAcknowledgeOffline: (device: Device) => void;
    onComments: (device: Device) => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (devices.length === 0) {
        return (
            <div className="p-12 text-center">
                <Server className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No devices found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                    Click "Add New" to create your first device
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[1200px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === devices.length && devices.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === devices.length) {
                                        devices.forEach(d => onToggleSelection(d.id));
                                    } else {
                                        devices.forEach(d => {
                                            if (!selectedIds.includes(d.id)) {
                                                onToggleSelection(d.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                        <th
                            onClick={() => onSort('name')}
                            className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                        <div className="flex items-center gap-1">
                            Name
                            {sortField === 'name' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th
                        onClick={() => onSort('ip_address')}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-1">
                            IP Address
                            {sortField === 'ip_address' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th
                        onClick={() => onSort('category')}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-1">
                            Category
                            {sortField === 'category' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th
                        onClick={() => onSort('status')}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Brand/Model</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {devices.map((device) => (
                    <tr 
                        key={device.id} 
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                            !device.is_active ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/50' : ''
                        }`}
                    >
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(device.id)}
                                onChange={() => onToggleSelection(device.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {device.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                            {device.ip_address}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-700">
                                {formatCategory(device.category)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                device.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                device.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                device.status === 'maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {device.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                device.is_active 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                                {device.is_active ? (
                                    <>
                                        <CheckCircle2 className="size-3" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <X className="size-3" />
                                        Inactive
                                    </>
                                )}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-3.5 text-slate-400" />
                                <span>{device.branch?.name || '-'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {device.location ? (
                                device.latitude && device.longitude ? (
                                    <button
                                        onClick={() => {
                                            router.visit('/monitor/maps', {
                                                data: {
                                                    deviceId: device.id,
                                                    lat: device.latitude,
                                                    lng: device.longitude,
                                                }
                                            });
                                        }}
                                        className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-2 py-1 text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                        title="View on map"
                                    >
                                        <MapPin className="size-3.5" />
                                        <span className="text-xs font-medium">{device.location.name}</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-3.5 text-slate-400" />
                                        <span>{device.location.name}</span>
                                    </div>
                                )
                            ) : (
                                <span className="text-slate-400 dark:text-slate-600">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            {device.hardware_detail ? (
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {device.hardware_detail.brand}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {device.hardware_detail.model}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-slate-400 dark:text-slate-600">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                {device.status === 'offline' && (
                                    <button 
                                        onClick={() => onAcknowledgeOffline(device)} 
                                        className="rounded-lg p-2 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30"
                                        title="Acknowledge Offline"
                                    >
                                        <CheckCircle2 className="size-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onView(device)} 
                                    className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                                    title="View Details"
                                >
                                    <Eye className="size-4" />
                                </button>
                                <button 
                                    onClick={() => onComments(device)} 
                                    className="rounded-lg p-2 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30"
                                    title="Manage Comments"
                                >
                                    <MessageCircle className="size-4" />
                                </button>
                                <button onClick={() => onEdit(device)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => onDelete(device)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Alerts Table Component
function AlertsTable({
    alerts,
    onEdit,
    onDelete,
    sortField,
    sortDirection,
    onSort,
    selectedIds,
    onToggleSelection,
}: {
    alerts: Alert[];
    onEdit: (alert: Alert) => void;
    onDelete: (alert: Alert) => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (alerts.length === 0) {
        return (
            <div className="p-12 text-center">
                <AlertTriangle className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No alerts found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === alerts.length && alerts.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === alerts.length) {
                                        alerts.forEach(a => onToggleSelection(a.id));
                                    } else {
                                        alerts.forEach(a => {
                                            if (!selectedIds.includes(a.id)) {
                                                onToggleSelection(a.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Device</th>
                    <th
                        onClick={() => onSort('title')}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-1">
                            Title
                            {sortField === 'title' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th
                        onClick={() => onSort('severity')}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-1">
                            Severity
                            {sortField === 'severity' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th
                        onClick={() => onSort('status')}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Acknowledged</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {alerts.map((alert) => (
                    <tr key={alert.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(alert.id)}
                                onChange={() => onToggleSelection(alert.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{alert.device?.name || `Device #${alert.device_id}`}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{alert.title}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                                {alert.severity}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                alert.resolved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                alert.status === 'active' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                                {alert.resolved ? 'Resolved' : alert.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                alert.acknowledged ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                                {alert.acknowledged ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => onEdit(alert)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => onDelete(alert)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Locations Table Component
function LocationsTable({
    locations,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelection,
}: {
    locations: Location[];
    onEdit: (location: Location) => void;
    onDelete: (location: Location) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (locations.length === 0) {
        return (
            <div className="p-12 text-center">
                <Server className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No locations found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                    Click "Add New" to create your first location
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === locations.length && locations.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === locations.length) {
                                        locations.forEach(l => onToggleSelection(l.id));
                                    } else {
                                        locations.forEach(l => {
                                            if (!selectedIds.includes(l.id)) {
                                                onToggleSelection(l.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Location Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Branch ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {locations.map((location) => (
                    <tr key={location.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(location.id)}
                                onChange={() => onToggleSelection(location.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {location.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {location.branch_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {location.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(location)}
                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                    <Edit className="size-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(location)}
                                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Branches Table Component
function BranchesTable({
    branches,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelection,
}: {
    branches: Branch[];
    onEdit: (branch: Branch) => void;
    onDelete: (branch: Branch) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (branches.length === 0) {
        return (
            <div className="p-12 text-center">
                <Building2 className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No branches found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                    Click "Add New" to create your first branch
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === branches.length && branches.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === branches.length) {
                                        branches.forEach(b => onToggleSelection(b.id));
                                    } else {
                                        branches.forEach(b => {
                                            if (!selectedIds.includes(b.id)) {
                                                onToggleSelection(b.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {branches.map((branch, index) => (
                    <tr 
                        key={branch.id} 
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                            !branch.is_active ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/50' : ''
                        }`}
                    >
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(branch.id)}
                                onChange={() => onToggleSelection(branch.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            #{index + 1}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                    <Building2 className="size-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {branch.name}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                {branch.code}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {branch.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {branch.address || '-'}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                branch.is_active 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                                {branch.is_active ? (
                                    <>
                                        <CheckCircle2 className="size-3" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <X className="size-3" />
                                        Inactive
                                    </>
                                )}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => onEdit(branch)} 
                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                    title="Edit branch"
                                >
                                    <Edit className="size-4" />
                                </button>
                                <button 
                                    onClick={() => onDelete(branch)} 
                                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                    title="Delete branch"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Users Table Component
function UsersTable({
    users,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelection,
}: {
    users: UserData[];
    onEdit: (user: UserData) => void;
    onDelete: (user: UserData) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (users.length === 0) {
        return (
            <div className="p-12 text-center">
                <User className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No users found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === users.length && users.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === users.length) {
                                        users.forEach(u => onToggleSelection(u.id));
                                    } else {
                                        users.forEach(u => {
                                            if (!selectedIds.includes(u.id)) {
                                                onToggleSelection(u.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(user.id)}
                                onChange={() => onToggleSelection(user.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => onEdit(user)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => onDelete(user)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Brands Table Component
function BrandsTable({
    brands,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelection,
}: {
    brands: Brand[];
    onEdit: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (brands.length === 0) {
        return (
            <div className="p-12 text-center">
                <Server className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No brands found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[700px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === brands.length && brands.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === brands.length) {
                                        brands.forEach(b => onToggleSelection(b.id));
                                    } else {
                                        brands.forEach(b => {
                                            if (!selectedIds.includes(b.id)) {
                                                onToggleSelection(b.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {brands.map((brand, index) => (
                    <tr key={brand.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(brand.id)}
                                onChange={() => onToggleSelection(brand.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{brand.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{brand.description || '-'}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => onEdit(brand)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => onDelete(brand)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Models Table Component
function ModelsTable({
    models,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelection,
}: {
    models: Model[];
    onEdit: (model: Model) => void;
    onDelete: (model: Model) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
    if (models.length === 0) {
        return (
            <div className="p-12 text-center">
                <Server className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No models found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 w-12">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === models.length && models.length > 0}
                                onChange={() => {
                                    if (selectedIds.length === models.length) {
                                        models.forEach(m => onToggleSelection(m.id));
                                    } else {
                                        models.forEach(m => {
                                            if (!selectedIds.includes(m.id)) {
                                                onToggleSelection(m.id);
                                            }
                                        });
                                    }
                                }}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {models.map((model, index) => (
                    <tr key={model.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(model.id)}
                                onChange={() => onToggleSelection(model.id)}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{model.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{model.brand?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{model.description || '-'}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => onEdit(model)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => onDelete(model)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

// Acknowledge Offline Form Component
function AcknowledgeOfflineForm({ device }: { device: Device }) {
    const [reason, setReason] = useState('');
    const [acknowledgedBy, setAcknowledgedBy] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/devices/${device.id}/acknowledge-offline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    reason,
                    acknowledged_by: acknowledgedBy,
                }),
            });

            if (response.ok) {
                router.reload();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to acknowledge offline device');
            }
        } catch (error) {
            console.error('Error acknowledging offline device:', error);
            alert('Failed to acknowledge offline device');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                        <p className="font-semibold text-orange-900 dark:text-orange-300">
                            Device: {device.name}
                        </p>
                        <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                            IP: {device.ip_address}
                        </p>
                        {device.offline_duration_minutes !== undefined && device.offline_duration_minutes > 0 && (
                            <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                                Offline for: {device.offline_duration_minutes} minute{device.offline_duration_minutes !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Acknowledged By <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={acknowledgedBy}
                    onChange={(e) => setAcknowledgedBy(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="Your name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="Explain why this device is offline (e.g., scheduled maintenance, hardware replacement, etc.)"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.reload()}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                    <CheckCircle2 className="size-4" />
                    {isSubmitting ? 'Acknowledging...' : 'Acknowledge Offline'}
                </button>
            </div>
        </form>
    );
}

// History View Component
function HistoryView({ activities }: { activities: ActivityLog[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created': return 'bg-green-500';
            case 'updated': return 'bg-blue-500';
            case 'deleted': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created': return <Plus className="size-4" />;
            case 'updated': return <Edit className="size-4" />;
            case 'deleted': return <Trash2 className="size-4" />;
            default: return <History className="size-4" />;
        }
    };

    const formatFieldName = (field: string) => {
        return field.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (activities.length === 0) {
        return (
            <div className="p-12 text-center">
                <History className="mx-auto mb-4 size-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No activity history found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                    Changes made to devices, locations, brands, and models will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity) => {
                const isExpanded = expandedId === activity.id;
                const entityName = activity.details?.device_name || activity.details?.location_name || activity.details?.brand_name || activity.details?.model_name || 'Unknown';
                // Filter out hardware_detail_id from changes
                const filteredChanges = activity.details?.changes ? 
                    Object.fromEntries(Object.entries(activity.details.changes).filter(([field]) => field !== 'hardware_detail_id')) : 
                    {};
                const hasChanges = Object.keys(filteredChanges).length > 0;

                return (
                    <div
                        key={activity.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                    >
                        <div className="flex items-start gap-4">
                            {/* Action Icon */}
                            <div className={`flex-shrink-0 rounded-full p-2 text-white ${getActionColor(activity.action)}`}>
                                {getActionIcon(activity.action)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                            {entityName} {activity.action}
                                        </h4>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3" />
                                                {activity.user}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">{activity.entity_type}</span>
                                            {activity.ip_address && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono text-xs">{activity.ip_address}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                                        {activity.time_ago}
                                    </span>
                                </div>

                                {/* Changes Detail */}
                                {hasChanges && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                            {isExpanded ? 'Hide' : 'Show'} Changes ({Object.keys(filteredChanges).length})
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
                                                {Object.entries(activity.details.changes)
                                                    .filter(([field]) => field !== 'hardware_detail_id') // Hide hardware_detail_id changes
                                                    .map(([field, value]) => {
                                                    // Check if value has old/new structure
                                                    const hasBeforeAfter = typeof value === 'object' && value !== null && 'old' in value && 'new' in value;
                                                    
                                                    return (
                                                        <div key={field} className="border-l-2 border-blue-500 pl-3">
                                                            <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                                {formatFieldName(field)}
                                                            </div>
                                                            {hasBeforeAfter ? (
                                                                <div className="space-y-1 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-red-600 dark:text-red-400 font-medium">Before:</span>
                                                                        <span className="font-mono text-slate-600 dark:text-slate-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                                                                            {value.old === null ? 'null' : String(value.old)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-green-600 dark:text-green-400 font-medium">After:</span>
                                                                        <span className="font-mono text-slate-600 dark:text-slate-400 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">
                                                                            {value.new === null ? 'null' : String(value.new)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Entity Form Component
function EntityForm({
    entity,
    mode,
    data,
    users,
}: {
    entity: CRUDEntity;
    mode: 'create' | 'edit';
    data: Device | Alert | Location | Branch | UserData | Brand | Model | null;
    users: UserData[];
}) {
    const { currentBranch } = usePage<PageProps>().props;
    
    const [latitude, setLatitude] = useState<string>(() => {
        if (entity === 'locations' && data) {
            const locationData = data as Location;
            return locationData.latitude?.toString() || '';
        }
        // Default to UTHM Parit Raja coordinates when creating new location
        if (entity === 'locations' && mode === 'create') {
            return '1.8655';
        }
        return '';
    });
    const [longitude, setLongitude] = useState<string>(() => {
        if (entity === 'locations' && data) {
            const locationData = data as Location;
            return locationData.longitude?.toString() || '';
        }
        // Default to UTHM Parit Raja coordinates when creating new location
        if (entity === 'locations' && mode === 'create') {
            return '103.0850';
        }
        return '';
    });

    // Alert-specific state
    const [alertDevices, setAlertDevices] = useState<Device[]>([]);
    const [selectedAlertBranchId, setSelectedAlertBranchId] = useState<number | null>(() => {
        if (entity === 'alerts' && currentBranch?.id) {
            return currentBranch.id;
        }
        return null;
    });

    // Fetch branches for alerts form
    useEffect(() => {
        if (entity === 'alerts') {
            fetch('/api/branches', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setBranches(data))
                .catch(err => console.error('Error loading branches:', err));
        }
    }, [entity]);

    // Fetch devices for alert form when branch changes
    useEffect(() => {
        if (entity === 'alerts' && selectedAlertBranchId) {
            fetch(`/api/devices?branch_id=${selectedAlertBranchId}`, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setAlertDevices(data))
                .catch(err => console.error('Error loading devices:', err));
        }
    }, [entity, selectedAlertBranchId]);

    // Fix Leaflet default marker icon
    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
        if (data && 'branch_id' in data && data.branch_id) {
            return data.branch_id;
        }
        return null;
    });
    
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);

    useEffect(() => {
        // Fetch branches for device/location forms
        if (entity === 'devices' || entity === 'locations') {
            fetch('/api/branches', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setBranches(data);
                // Auto-select current branch for new items
                if (mode === 'create' && currentBranch?.id && !selectedBranchId) {
                    setSelectedBranchId(currentBranch.id);
                }
            })
            .catch(err => console.error('Error loading branches:', err));
        }

        // Fetch locations and hardware details when creating/editing devices
        if (entity === 'devices') {
            fetch('/api/locations', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setLocations(data))
            .catch(err => console.error('Error loading locations:', err));

            // Fetch brands
            fetch('/api/brands', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setBrands(data))
            .catch(err => console.error('Error loading brands:', err));

            // Fetch models
            fetch('/api/models', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setModels(data))
            .catch(err => console.error('Error loading models:', err));
        }
    }, [entity, currentBranch, mode, selectedBranchId]);

    // Filter locations by selected branch
    const filteredLocations = selectedBranchId 
        ? locations.filter(loc => loc.branch_id === selectedBranchId)
        : locations;

    if (entity === 'branches') {
        const branchData = data as Branch | null;
        return (
            <form className="space-y-6">
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Branch Information</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Branch Name * 
                                <span className="ml-1 text-xs text-slate-500">(e.g., UTHM Kampus Parit Raja)</span>
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                defaultValue={branchData?.name || ''} 
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                placeholder="Enter branch name" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Branch Code * 
                                <span className="ml-1 text-xs text-slate-500">(e.g., PR, PG)</span>
                            </label>
                            <input 
                                type="text" 
                                name="code" 
                                defaultValue={branchData?.code || ''} 
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                placeholder="Enter branch code" 
                                required 
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Description
                            </label>
                            <input 
                                type="text" 
                                name="description" 
                                defaultValue={branchData?.description || ''} 
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                placeholder="Brief description of the branch"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Address
                            </label>
                            <textarea 
                                name="address" 
                                defaultValue={branchData?.address || ''} 
                                rows={3} 
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                placeholder="Full branch address"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="is_active" 
                                    defaultChecked={branchData?.is_active ?? true} 
                                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700" 
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    Branch is active
                                    <span className="ml-2 text-xs text-slate-500">(Active branches are visible in the branch selector)</span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Show current statistics for existing branches */}
                {mode === 'edit' && branchData && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                        <h5 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Branch Statistics
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-blue-700 dark:text-blue-300">Branch ID:</span>
                                <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                                    {branchData.id}
                                </span>
                            </div>
                            <div>
                                <span className="text-blue-700 dark:text-blue-300">Status:</span>
                                <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                                    {branchData.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning for delete operations */}
                {mode === 'edit' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-300">
                                <p className="font-semibold">Important Notes:</p>
                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                    <li>Deleting a branch will also delete all associated devices, locations, and alerts</li>
                                    <li>Deactivating a branch hides it from the branch selector but preserves all data</li>
                                    <li>Consider deactivating instead of deleting for data preservation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        );
    }

    if (entity === 'devices') {
        const deviceData = data as Device | null;
        
        // Initialize location from device data
        const [selectedLocationId, setSelectedLocationId] = useState<number | null>(() => {
            if (deviceData?.location_id) {
                return deviceData.location_id;
            }
            return null;
        });

        // Initialize model and brand from device's hardware_detail (already in deviceData from API)
        const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
        const [brandFilter, setBrandFilter] = useState<number | null>(null);

        // Set initial hardware values when models are loaded
        useEffect(() => {
            if (mode === 'edit' && deviceData && models.length > 0) {
                // Get model info from the device's hardware_detail that came from API
                if (deviceData.hardware_detail_id) {
                    // Find model by matching brand and model names from device data
                    const deviceBrand = deviceData.hardware_detail?.brand;
                    const deviceModel = deviceData.hardware_detail?.model;
                    
                    if (deviceBrand && deviceModel) {
                        // Find brand by name
                        const brand = brands.find(b => b.name === deviceBrand);
                        if (brand) {
                            setBrandFilter(brand.id);
                            
                            // Find model by name and brand
                            const model = models.find(m => 
                                m.name === deviceModel && m.brand_id === brand.id
                            );
                            if (model) {
                                setSelectedModelId(model.id);
                            }
                        }
                    }
                }
            }
        }, [mode, deviceData, models, brands]);

        const selectedModel = models.find(m => m.id === selectedModelId);
        const selectedBrand = selectedModel?.brand;

        const filteredModels = brandFilter 
            ? models.filter(m => m.brand_id === brandFilter)
            : models;
        
        // Initialize branch_id from device data or current branch
        useEffect(() => {
            if (mode === 'edit' && deviceData?.branch_id) {
                setSelectedBranchId(deviceData.branch_id);
            } else if (mode === 'create' && currentBranch?.id && !selectedBranchId) {
                setSelectedBranchId(currentBranch.id);
            }
        }, [deviceData, currentBranch, mode]);

        // Only reset location in create mode
        useEffect(() => {
            if (mode === 'create' && selectedBranchId !== deviceData?.branch_id) {
                setSelectedLocationId(null);
            }
        }, [selectedBranchId, mode, deviceData?.branch_id]);

        return (
            <form className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Basic Information</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Device Name *</label>
                            <input type="text" name="name" defaultValue={deviceData?.name || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Enter device name" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Barcode *</label>
                            <input type="text" name="barcode" defaultValue={deviceData?.barcode || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Enter barcode" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Serial Number</label>
                            <input type="text" name="serial_number" defaultValue={deviceData?.serial_number || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Enter serial number" />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Managed By</label>
                            <select name="managed_by" defaultValue={deviceData?.managed_by || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                                <option value="">Not Assigned</option>
                                {users && users.length > 0 && users.map((user: UserData) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">IP Address *</label>
                            <input type="text" name="ip_address" defaultValue={deviceData?.ip_address || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$" placeholder="192.168.1.1" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">MAC Address</label>
                            <input type="text" name="mac_address" defaultValue={deviceData?.mac_address || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="00:1A:2B:3C:4D:5E" />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Category *</label>
                            <select name="category" defaultValue={deviceData?.category || 'switches'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="switches">Switches</option>
                                <option value="servers">Servers</option>
                                <option value="wifi">WiFi</option>
                                <option value="tas">TAS</option>
                                <option value="cctv">CCTV</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status *</label>
                            <select name="status" defaultValue={deviceData?.status || 'offline'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="warning">Warning</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Location Information</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Branch *</label>
                            <select 
                                name="branch_id" 
                                value={selectedBranchId || ''} 
                                onChange={(e) => {
                                    const newBranchId = e.target.value ? Number(e.target.value) : null;
                                    setSelectedBranchId(newBranchId);
                                    // Only reset location in create mode
                                    if (mode === 'create') {
                                        setSelectedLocationId(null);
                                    }
                                }} 
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                required
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Location *
                            </label>
                            <select 
                                name="location_id" 
                                value={selectedLocationId || ''} 
                                onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                disabled={!selectedBranchId}
                                required
                            >
                                <option value="">Select Location</option>
                                {filteredLocations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))}
                            </select>
                            {!selectedBranchId && (
                                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                    Select a branch first
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hardware Details */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hardware Details</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Brand *</label>
                            <select 
                                value={brandFilter || ''} 
                                onChange={(e) => {
                                    const newBrandId = e.target.value ? Number(e.target.value) : null;
                                    setBrandFilter(newBrandId);
                                    setSelectedModelId(null);
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Model *</label>
                            <select 
                                name="model_id"
                                value={selectedModelId || ''}
                                onChange={(e) => setSelectedModelId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                disabled={!brandFilter}
                                required
                            >
                                <option value="">Select Model</option>
                                {filteredModels.map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                            {!brandFilter && (
                                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                    Select a brand first
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {selectedBrand && selectedModel && (
                        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Selected Hardware:</p>
                            <p className="mt-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                                {selectedBrand.name} - {selectedModel.name}
                            </p>
                        </div>
                    )}

                    <div className="mt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="is_active" defaultChecked={deviceData?.is_active ?? true} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Device is active</span>
                        </label>
                    </div>
                </div>

                {/* Info panel */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                    <h5 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Device Requirements
                    </h5>
                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                        <li>• IP address and barcode must be unique across all devices</li>
                        <li>• Branch and location are required - location is filtered by selected branch</li>
                        <li>• Hardware: Select brand first, then choose model from that brand</li>
                        <li>• Add brands and models in their respective tabs before creating devices</li>
                    </ul>
                </div>
            </form>
        );
    }

    if (entity === 'alerts') {
        const alertData = data as Alert | null;

        return (
            <form className="space-y-6">
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Alert Information</h4>
                    <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Branch *</label>
                                <select 
                                    value={selectedAlertBranchId || ''} 
                                    onChange={(e) => setSelectedAlertBranchId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                    required
                                    disabled={mode === 'edit'}
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Device *</label>
                                <select 
                                    name="device_id" 
                                    defaultValue={alertData?.device_id || ''} 
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    disabled={!selectedAlertBranchId || mode === 'edit'}
                                    required
                                >
                                    <option value="">Select Device</option>
                                    {alertDevices.map(device => (
                                        <option key={device.id} value={device.id}>
                                            {device.name} ({device.ip_address})
                                        </option>
                                    ))}
                                </select>
                                {!selectedAlertBranchId && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                        Select a branch first
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Alert Details</h4>
                    <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Category *</label>
                                <select name="category" defaultValue={alertData?.category || 'manual'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                    <option value="manual">Manual</option>
                                    <option value="offline">Offline</option>
                                    <option value="performance">Performance</option>
                                    <option value="security">Security</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Severity</label>
                                <select name="severity" defaultValue={alertData?.severity || 'medium'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                            <input type="text" name="title" defaultValue={alertData?.title || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Alert title" />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                            <textarea name="message" defaultValue={alertData?.message || ''} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Alert message or description" />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Alert Management</h4>
                    <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                <select name="status" defaultValue={alertData?.status || 'active'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                                    <option value="active">Active</option>
                                    <option value="acknowledged">Acknowledged</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Acknowledged By</label>
                                <input type="text" name="acknowledged_by" defaultValue={alertData?.acknowledged_by || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason/Action Taken</label>
                            <textarea name="reason" defaultValue={alertData?.reason || ''} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Describe the action taken or reason for acknowledgment" />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="acknowledged" defaultChecked={alertData?.acknowledged ?? false} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Mark as acknowledged</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="resolved" defaultChecked={alertData?.resolved ?? false} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Mark as resolved</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    if (entity === 'locations') {
        const locationData = data as Location | null;
        
        // Initialize branch_id from location data or current branch
        useEffect(() => {
            if (mode === 'edit' && locationData?.branch_id) {
                setSelectedBranchId(locationData.branch_id);
            } else if (mode === 'create' && currentBranch?.id && !selectedBranchId) {
                setSelectedBranchId(currentBranch.id);
            }
        }, [locationData, currentBranch, mode]);

        return (
            <form className="space-y-6">
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Location Information</h4>
                    <div className="grid gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Location Name *</label>
                            <input type="text" name="name" defaultValue={locationData?.name || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g., Server Room A, Floor 3 West Wing" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Branch *</label>
                            <select 
                                name="branch_id" 
                                value={selectedBranchId || ''} 
                                onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                required
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Latitude *</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="latitude" 
                                    value={latitude} 
                                    onChange={(e) => setLatitude(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                    placeholder="1.853639"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Longitude *</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="longitude" 
                                    value={longitude} 
                                    onChange={(e) => setLongitude(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                    placeholder="103.080925"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Click on map to set location
                            </label>
                            <div className="h-96 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
                                <LocationMapPicker 
                                    latitude={latitude ? parseFloat(latitude) : 3.1390} 
                                    longitude={longitude ? parseFloat(longitude) : 101.6869}
                                    onLocationSelect={(lat, lng) => {
                                        setLatitude(lat.toFixed(6));
                                        setLongitude(lng.toFixed(6));
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Click anywhere on the map to set the location coordinates
                            </p>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                            <textarea name="description" defaultValue={locationData?.description || ''} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Additional details about this location" />
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                    <h5 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Location Requirements
                    </h5>
                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                        <li>• Latitude and longitude are required for map display</li>
                        <li>• Use decimal degrees format (e.g., 1.853639, 103.080925)</li>
                        <li>• Locations are filtered by branch in the device form</li>
                    </ul>
                </div>
            </form>
        );
    }

    if (entity === 'users') {
        const userData = data as UserData | null;
        return (
            <form className="space-y-6">
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">User Information</h4>
                    <div className="grid gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                            <input type="text" name="name" defaultValue={userData?.name || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
                            <input type="email" name="email" defaultValue={userData?.email || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Role *</label>
                            <select name="role" defaultValue={userData?.role || 'staff'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {mode === 'create' ? 'Password *' : 'New Password (leave blank to keep current)'}
                            </label>
                            <input type="password" name="password" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" {...(mode === 'create' ? { required: true } : {})} />
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    if (entity === 'brands') {
        const brandData = data as Brand | null;
        return (
            <form className="space-y-6">
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Brand Information</h4>
                    <div className="grid gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Brand Name *</label>
                            <input type="text" name="name" defaultValue={brandData?.name || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g., Cisco, HP, Dell" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                            <textarea name="description" defaultValue={brandData?.description || ''} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Brief description" />
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    if (entity === 'models') {
        const modelData = data as Model | null;
        const [modelBrands, setModelBrands] = useState<Brand[]>([]);

        useEffect(() => {
            fetch('/api/brands', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setModelBrands(data))
            .catch(err => console.error('Error loading brands:', err));
        }, []);

        return (
            <form className="space-y-6">
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Model Information</h4>
                    <div className="grid gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Brand *</label>
                            <select name="brand_id" defaultValue={modelData?.brand_id || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="">Select Brand</option>
                                {modelBrands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Model Name *</label>
                            <input type="text" name="name" defaultValue={modelData?.name || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="e.g., Catalyst 2960, ProLiant DL380" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                            <textarea name="description" defaultValue={modelData?.description || ''} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Brief description" />
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    return (
        <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            Form for {entity} coming soon
        </div>
    );
}

// Location Map Picker Component
function LocationMapPicker({ 
    latitude, 
    longitude, 
    onLocationSelect 
}: { 
    latitude: number; 
    longitude: number; 
    onLocationSelect: (lat: number, lng: number) => void;
}) {
    function MapClickHandler() {
        useMapEvents({
            click(e) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    }

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} />
            <MapClickHandler />
        </MapContainer>
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
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={200}>200 per page</option>
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