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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/i18n-context';

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
        manufacturer: string;
        model: string;
    };
    name: string;
    ip_address: string;
    mac_address?: string;
    barcode: string;
    type: string;
    category: string;
    status: string;
    building: string;
    uptime_percentage: number;
    is_active: boolean;
    response_time?: number;
    last_check?: string;
    offline_reason?: string;
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

type CRUDEntity = 'branches' | 'devices' | 'alerts' | 'locations' | 'users';

export default function Configuration() {
    const { t } = useTranslation();
    
    // CRUD state
    const [selectedEntity, setSelectedEntity] = useState<CRUDEntity>('devices');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
    const [selectedItem, setSelectedItem] = useState<Device | Alert | Location | Branch | UserData | null>(null);

    // Data state
    const [devices, setDevices] = useState<Device[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
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
            };

            const endpoint = entityMap[selectedEntity];
            if (!endpoint) {
                setIsLoading(false);
                return;
            }

            const response = await fetch(endpoint, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                switch (selectedEntity) {
                    case 'branches':
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
                }
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

    const handleEdit = (item: Device | Alert | Location | Branch | UserData) => {
        setModalMode('edit');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleDelete = (item: Device | Alert | Location | Branch | UserData) => {
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
                alerts: '/api/alerts',
                locations: '/api/locations',
                users: '/api/users',
            };

            const baseUrl = entityMap[selectedEntity];
            const url = modalMode === 'create' 
                ? baseUrl 
                : `${baseUrl}/${selectedItem?.id}`;
            
            const method = modalMode === 'create' ? 'POST' : 'PUT';
            
            const formData = new FormData(document.querySelector('form') as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            
            // Convert boolean checkboxes
            ['is_active', 'acknowledged', 'resolved'].forEach(field => {
                if (data[field] === 'on') {
                    data[field] = 'true';
                } else if (!data[field]) {
                    data[field] = 'false';
                }
            });
            
            const csrfToken = await getCsrfToken();

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await fetchData();
                setShowModal(false);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to save');
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

    // Main configuration interface
    return (
        <MonitorLayout title={t('config.title')}>
            <div className="space-y-6">
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
                    {(['branches', 'devices', 'alerts', 'locations', 'users'] as CRUDEntity[]).map((entity) => (
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
                                                {selectedItem.name || selectedItem.title || `ID: ${selectedItem.id}`}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hardware</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {device.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {device.ip_address}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {device.category}
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
                            {device.branch?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {device.location?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {device.hardware_detail ? `${device.hardware_detail.manufacturer} ${device.hardware_detail.model}` : '-'}
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
                <Server className="mx-auto mb-4 size-12 text-slate-400" />
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {branches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{branch.code}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{branch.address || '-'}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                branch.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {branch.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => onEdit(branch)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => onDelete(branch)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
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

// Entity Form Component
function EntityForm({
    entity,
    mode,
    data,
}: {
    entity: CRUDEntity;
    mode: 'create' | 'edit';
    data: Device | Alert | Location | Branch | UserData | null;
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
    
    const [manufacturers, setManufacturers] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);

    useEffect(() => {
        // Fetch branches for device/location forms
        if (entity === 'devices' || entity === 'locations') {
            fetch('/api/branches', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setBranches(data))
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

            // Fetch manufacturers
            fetch('/api/hardware/manufacturers', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setManufacturers(data))
            .catch(err => console.error('Error loading manufacturers:', err));

            // Fetch models
            fetch('/api/hardware/models', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setModels(data))
            .catch(err => console.error('Error loading models:', err));
        }
    }, [entity]);

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
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Branch Name *</label>
                            <input type="text" name="name" defaultValue={branchData?.name || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="UTHM Kampus Parit Raja" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Branch Code *</label>
                            <input type="text" name="code" defaultValue={branchData?.code || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="PR" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                            <input type="text" name="description" defaultValue={branchData?.description || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                            <textarea name="address" defaultValue={branchData?.address || ''} rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="is_active" defaultChecked={branchData?.is_active ?? true} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Branch is active</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    if (entity === 'devices') {
        const deviceData = data as Device | null;
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
                            <select name="category" defaultValue={deviceData?.category || 'switch'} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="switch">Switch</option>
                                <option value="server">Server</option>
                                <option value="wifi">WiFi</option>
                                <option value="TAS">TAS</option>
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
                            <select name="branch_id" value={selectedBranchId || ''} onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                            <select name="location_id" defaultValue={deviceData?.location_id || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" disabled={!selectedBranchId}>
                                <option value="">Select Location</option>
                                {filteredLocations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Building</label>
                            <input type="text" name="building" defaultValue={deviceData?.building || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Building name" />
                        </div>
                    </div>
                </div>

                {/* Hardware Details */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hardware Details</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Manufacturer</label>
                            <input 
                                type="text" 
                                name="manufacturer" 
                                defaultValue={deviceData?.hardware_detail?.manufacturer || ''} 
                                list="manufacturers-list"
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                placeholder="e.g., Cisco, HP, Dell" 
                            />
                            <datalist id="manufacturers-list">
                                {manufacturers.map(mfr => (
                                    <option key={mfr} value={mfr} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
                            <input 
                                type="text" 
                                name="model" 
                                defaultValue={deviceData?.hardware_detail?.model || ''} 
                                list="models-list"
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                placeholder="Model number" 
                            />
                            <datalist id="models-list">
                                {models.map(mdl => (
                                    <option key={mdl} value={mdl} />
                                ))}
                            </datalist>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="is_active" defaultChecked={deviceData?.is_active ?? true} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Device is active</span>
                            </label>
                        </div>
                    </div>
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
                            <select name="branch_id" defaultValue={locationData?.branch_id || ''} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required>
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Latitude</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="latitude" 
                                    value={latitude} 
                                    onChange={(e) => setLatitude(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                    placeholder="1.853639" 
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Longitude</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="longitude" 
                                    value={longitude} 
                                    onChange={(e) => setLongitude(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
                                    placeholder="103.080925" 
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

    return (
        <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            Form for {entity} coming soon
        </div>
    );
}
