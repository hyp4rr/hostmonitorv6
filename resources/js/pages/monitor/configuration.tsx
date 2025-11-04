import MonitorLayout from '@/layouts/monitor-layout';
import {
    AlertTriangle,
    Edit,
    Plus,
    Save,
    Server,
    Trash2,
    User,
    X,
    Building2,
    MapPin, // Add MapPin icon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import type { CurrentBranch } from '@/types/branch';
import { PageProps } from '@/types';

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
    type: string;
    category: string;
    status: string;
    uptime_percentage: number;
    is_active: boolean;
    response_time?: number;
    last_check?: string;
    offline_reason?: string;
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

type CRUDEntity = 'branches' | 'devices' | 'alerts' | 'locations' | 'users' | 'brands' | 'models';

export default function Configuration() {
    const { t } = useTranslation();
    const { currentBranch } = usePage<PageProps>().props;
    
    // CRUD state
    const [selectedEntity, setSelectedEntity] = useState<CRUDEntity>('devices');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
    const [selectedItem, setSelectedItem] = useState<Device | Alert | Location | Branch | UserData | Brand | Model | null>(null);

    // Data state
    const [devices, setDevices] = useState<Device[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data when entity changes
    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEntity]);

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
            };

            let endpoint = entityMap[selectedEntity];
            if (!endpoint) {
                setIsLoading(false);
                return;
            }

            // Add branch filter for devices, alerts, and locations
            if (currentBranch?.id && ['devices', 'alerts', 'locations'].includes(selectedEntity)) {
                endpoint += `?branch_id=${currentBranch.id}`;
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
                const data = await response.json();
                console.log('Fetched data:', data);
                
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

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const entityMap: Record<CRUDEntity, string> = {
                branches: '/api/branches',
                devices: '/api/devices',
                alerts: '/api alerts',
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

    // Add error logging
    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            console.error('Configuration page error:', error);
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

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
                    {(['branches', 'devices', 'alerts', 'locations', 'brands', 'models', 'users'] as CRUDEntity[]).map((entity) => (
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
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105"
                        >
                            <Plus className="size-4" />
                            Add New
                        </button>
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
                                    <BranchesTable
                                        branches={branches}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                )}
                                {selectedEntity === 'devices' && (
                                    <DevicesTable
                                        devices={devices}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                )}
                                {selectedEntity === 'alerts' && (
                                    <AlertsTable
                                        alerts={alerts}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                )}
                                {selectedEntity === 'locations' && (
                                    <LocationsTable
                                        locations={locations}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                )}
                                {selectedEntity === 'users' && (
                                    <UsersTable
                                        users={users}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                )}
                                {selectedEntity === 'brands' && (
                                    <BrandsTable
                                        brands={brands}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                )}
                                {selectedEntity === 'models' && (
                                    <ModelsTable
                                        models={models}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
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
                            ) : (
                                <EntityForm
                                    entity={selectedEntity}
                                    mode={modalMode}
                                    data={selectedItem}
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
        </MonitorLayout>
    );
}

// Devices Table Component
function DevicesTable({
    devices,
    onEdit,
    onDelete,
}: {
    devices: Device[];
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Brand/Model</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {device.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                            {device.ip_address}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-700">
                                {device.category}
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
    );
}

// Alerts Table Component
function AlertsTable({
    alerts,
    onEdit,
    onDelete,
}: {
    alerts: Alert[];
    onEdit: (alert: Alert) => void;
    onDelete: (alert: Alert) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Acknowledged</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
    );
}

// Locations Table Component
function LocationsTable({
    locations,
    onEdit,
    onDelete,
}: {
    locations: Location[];
    onEdit: (location: Location) => void;
    onDelete: (location: Location) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
    );
}

// Branches Table Component
function BranchesTable({
    branches,
    onEdit,
    onDelete,
}: {
    branches: Branch[];
    onEdit: (branch: Branch) => void;
    onDelete: (branch: Branch) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        ID
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
                        Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {branches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            #{branch.id}
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
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                branch.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                <div className={`size-1.5 rounded-full ${
                                    branch.is_active ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                {branch.is_active ? 'Active' : 'Inactive'}
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
    );
}

// Users Table Component
function UsersTable({
    users,
    onEdit,
    onDelete,
}: {
    users: UserData[];
    onEdit: (user: UserData) => void;
    onDelete: (user: UserData) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
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
    );
}

// Brands Table Component
function BrandsTable({
    brands,
    onEdit,
    onDelete,
}: {
    brands: Brand[];
    onEdit: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{brand.id}</td>
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
    );
}

// Models Table Component
function ModelsTable({
    models,
    onEdit,
    onDelete,
}: {
    models: Model[];
    onEdit: (model: Model) => void;
    onDelete: (model: Model) => void;
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
        <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {models.map((model) => (
                    <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{model.id}</td>
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
    );
}

// Entity Form Component
function EntityForm({
    entity,
    mode,
    data,
}: {
    entity: CRUDEntity;
    mode: 'create' | 'edit';
    data: Device | Alert | Location | Branch | UserData | Brand | Model | null;
}) {
    const [latitude, setLatitude] = useState<string>(() => {
        if (data && 'latitude' in data && data.latitude) {
            return String(data.latitude);
        }
        return '';
    });
    
    const [longitude, setLongitude] = useState<string>(() => {
        if (data && 'longitude' in data && data.longitude) {
            return String(data.longitude);
        }
        return '';
    });
    
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

    // Get current branch from page props
    const { currentBranch } = usePage<PageProps>().props;

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
                        {latitude && longitude && (
                            <div className="h-64 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
                                <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(longitude)-0.01}%2C${parseFloat(latitude)-0.01}%2C${parseFloat(longitude)+0.01}%2C${parseFloat(latitude)+0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`} className="size-full" title="Location Map" />
                            </div>
                        )}
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