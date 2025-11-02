import MonitorLayout from '@/layouts/monitor-layout';
import {
    AlertTriangle,
    Check,
    Edit,
    Eye,
    EyeOff,
    Lock,
    Plus,
    Save,
    Server,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';

interface Device {
    id: number;
    name: string;
    ip_address: string;
    type: string;
    category: string;
    status: string;
    location: string;
    building: string;
    manufacturer: string;
    model: string;
    priority: number;
    uptime_percentage: number;
    is_monitored: boolean;
    is_active: boolean;
}

interface Alert {
    id: number;
    device_id: number;
    type: string;
    severity: string;
    title: string;
    message: string;
    status: string;
}

type CRUDEntity = 'devices' | 'alerts' | 'users' | 'settings';

export default function Configuration() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // CRUD state
    const [selectedEntity, setSelectedEntity] = useState<CRUDEntity>('devices');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Mock data - replace with actual API calls
    const [devices, setDevices] = useState<Device[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    // Handle login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simple authentication - replace with actual API call
        if (username === 'admin' && password === 'admin') {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Invalid username or password');
        }
    };

    // Handle logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    // CRUD operations
    const handleCreate = () => {
        setModalMode('create');
        setSelectedItem(null);
        setShowModal(true);
    };

    const handleEdit = (item: any) => {
        setModalMode('edit');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleDelete = (item: any) => {
        setModalMode('delete');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleSave = () => {
        // Implement save logic here
        console.log('Saving:', modalMode, selectedItem);
        setShowModal(false);
    };

    const handleConfirmDelete = () => {
        // Implement delete logic here
        console.log('Deleting:', selectedItem);
        setShowModal(false);
    };

    // Login screen
    if (!isAuthenticated) {
        return (
            <MonitorLayout title={t('config.title')}>
                <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-8 shadow-xl dark:border-slate-700/50 dark:bg-slate-800">
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                    <Lock className="size-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300">
                                    {t('config.title')}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    Please login to access configuration settings
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {loginError && (
                                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertTriangle className="size-4" />
                                        {loginError}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('config.username')}
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                            placeholder="Enter username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('config.password')}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-12 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                            placeholder="Enter password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    {t('config.login')}
                                </button>

                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    Default credentials: admin / admin
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </MonitorLayout>
        );
    }

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
                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105"
                    >
                        {t('config.logout')}
                    </button>
                </div>

                {/* Entity selector tabs */}
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200/50 bg-white p-2 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    {(['devices', 'alerts', 'users', 'settings'] as CRUDEntity[]).map((entity) => (
                        <button
                            key={entity}
                            onClick={() => setSelectedEntity(entity)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
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
                        {selectedEntity === 'users' && (
                            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                                User management coming soon
                            </div>
                        )}
                        {selectedEntity === 'settings' && (
                            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                                System settings coming soon
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Create/Edit/Delete */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
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
                        <div className="p-6">
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
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            {modalMode === 'delete' ? (
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                >
                                    <Trash2 className="size-4" />
                                    Delete
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <Save className="size-4" />
                                    Save
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Actions
                    </th>
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
                            {device.type}
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    device.status === 'up' || device.status === 'online'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : device.status === 'warning'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                            >
                                {device.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {device.location}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(device)}
                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                    <Edit className="size-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(device)}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Type
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
                {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {alert.title}
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    alert.severity === 'critical'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        : alert.severity === 'warning'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}
                            >
                                {alert.severity}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {alert.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {alert.status}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(alert)}
                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                    <Edit className="size-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(alert)}
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

// Entity Form Component
function EntityForm({
    entity,
    mode,
    data,
}: {
    entity: CRUDEntity;
    mode: 'create' | 'edit';
    data: any;
}) {
    if (entity === 'devices') {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Device Name
                        </label>
                        <input
                            type="text"
                            defaultValue={data?.name}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            placeholder="Enter device name"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            IP Address
                        </label>
                        <input
                            type="text"
                            defaultValue={data?.ip_address}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            placeholder="192.168.1.1"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Type
                        </label>
                        <select
                            defaultValue={data?.type}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="switch">Switch</option>
                            <option value="router">Router</option>
                            <option value="server">Server</option>
                            <option value="firewall">Firewall</option>
                            <option value="access_point">Access Point</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Location
                        </label>
                        <input
                            type="text"
                            defaultValue={data?.location}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            placeholder="Enter location"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Manufacturer
                        </label>
                        <input
                            type="text"
                            defaultValue={data?.manufacturer}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            placeholder="Enter manufacturer"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Model
                        </label>
                        <input
                            type="text"
                            defaultValue={data?.model}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            placeholder="Enter model"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            Form for {entity} coming soon
        </div>
    );
}
