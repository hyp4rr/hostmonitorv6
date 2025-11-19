import MonitorLayout from '@/layouts/monitor-layout';
import { usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Server, Wifi, Upload, Save, ZoomIn, ZoomOut, RotateCcw, Edit, Trash2, Plus, X, Building2, Layers, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { getDeviceCategoryIcon } from '@/utils/device-icons';

type PageProps = { currentBranch: any };

type Floor = {
    id: number;
    branch_id?: number | null;
    location_id?: number | null;
    name: string;
    level?: number | null;
    plan_image_path?: string | null;
};

type Device = {
    id: number;
    name: string;
    ip_address: string;
    category: string;
    status?: string;
    hardware_detail?: {
        hardware_model?: {
        } | null;
    } | null;
};

type DevicePosition = {
    id: number;
    device_id: number;
    floor_id: number;
    x: number;
    y: number;
    marker_type?: string | null;
    device?: Device;
};

export default function PlanPage() {
    const { currentBranch } = usePage<PageProps>().props;
    const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
    const locationIdFromQuery = useMemo(() => {
        const v = searchParams.get('location_id');
        return v ? Number(v) : null;
    }, [searchParams]);
    const floorIdFromQuery = useMemo(() => {
        const v = searchParams.get('floor_id');
        return v ? Number(v) : null;
    }, [searchParams]);
    const deviceIdFromQuery = useMemo(() => {
        const v = searchParams.get('deviceId');
        return v ? Number(v) : null;
    }, [searchParams]);
    const canEdit = useMemo(() => searchParams.get('mode') === 'config', [searchParams]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
    const [positions, setPositions] = useState<DevicePosition[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<number | ''>('');
    const [creating, setCreating] = useState(false);
    const [newFloor, setNewFloor] = useState<{ name: string; level?: number | null; plan_image_path?: string }>({ name: '' });
    const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
    const [showFloorModal, setShowFloorModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [locations, setLocations] = useState<Array<{ id: number; name: string; branch_id: number }>>([]);
    const [draggingDeviceId, setDraggingDeviceId] = useState<number | null>(null);
    const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [isPanning, setIsPanning] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const panStartRef = useRef<{ x: number; y: number } | null>(null);

    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const selectedFloor = useMemo(() => floors.find(f => f.id === selectedFloorId) || null, [floors, selectedFloorId]);

    // Load locations for floor creation/editing
    useEffect(() => {
        const branchId = currentBranch?.id ? String(currentBranch.id) : null;
        const url = branchId === 'all' 
            ? '/api/locations'
            : branchId ? `/api/locations?branch_id=${branchId}` : '/api/locations';
        
        fetch(url, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        })
        .then(r => r.ok ? r.json() : [])
        .then(setLocations)
        .catch(() => setLocations([]));
    }, [currentBranch?.id]);

    useEffect(() => {
        // Load floors for current branch / location
        const params = new URLSearchParams();
        // If 'all' branches selected, fetch all floors without branch_id filter
        // But if location_id is provided, we can still filter by location_id regardless of branch
        const branchId = currentBranch?.id ? String(currentBranch.id) : null;
        if (branchId && branchId !== 'all') {
            params.set('branch_id', branchId);
        }
        if (locationIdFromQuery) {
            params.set('location_id', String(locationIdFromQuery));
        }
        const floorsUrl = params.toString() ? `/api/floors?${params.toString()}` : '/api/floors';
        console.log('Fetching floors from:', floorsUrl);
        fetch(floorsUrl)
            .then(r => r.json())
            .then((data: Floor[]) => {
                console.log('Floors loaded:', data.length, data);
                setFloors(data);
                // Preselect floor via query or first available
                if (floorIdFromQuery && data.some(f => f.id === floorIdFromQuery)) {
                    setSelectedFloorId(floorIdFromQuery);
                } else if (data.length > 0) {
                    setSelectedFloorId(data[0].id);
                } else {
                    // No floors found - clear selection
                    setSelectedFloorId(null);
                }
            })
            .catch((err) => {
                console.error('Error loading floors:', err);
                setFloors([]);
            });

        // Load devices for current branch
        const devParams = new URLSearchParams();
        devParams.set('per_page', '1000');
        // If 'all' branches selected, fetch all devices without branch_id filter
        if (branchId && branchId !== 'all') {
            devParams.set('branch_id', branchId);
        }
        const devicesUrl = devParams.toString() ? `/api/devices?${devParams.toString()}` : '/api/devices?per_page=1000';
        fetch(devicesUrl)
            .then(r => r.json())
            .then(res => {
                const list = res?.data || [];
                setDevices(list);
                if (deviceIdFromQuery && list.some((d: Device) => d.id === deviceIdFromQuery)) {
                    setSelectedDeviceId(deviceIdFromQuery);
                }
            })
            .catch(() => setDevices([]));
    }, [currentBranch?.id, locationIdFromQuery, floorIdFromQuery, deviceIdFromQuery]);

    useEffect(() => {
        if (!selectedFloorId) return;
        fetch(`/api/device-positions?floor_id=${selectedFloorId}`)
            .then(r => r.json())
            .then(setPositions)
            .catch(() => setPositions([]));
    }, [selectedFloorId]);

    // Cleanup animation frames on unmount or when dragging stops
    useEffect(() => {
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    const savePosition = async (payload: { floor_id: number; device_id: number; x: number; y: number; marker_type?: string | undefined }) => {
        try {
            const res = await fetch('/api/device-positions/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.error('Save position failed:', res.status, text);
                alert(`Failed to save position (${res.status}).`);
                return;
            }
            const saved = await res.json();
            setPositions(prev => {
                const idx = prev.findIndex(p => p.device_id === saved.device_id && p.floor_id === saved.floor_id);
                if (idx >= 0) {
                    const copy = prev.slice();
                    copy[idx] = saved;
                    return copy;
                }
                return [...prev, saved];
            });
            // Reload positions to get fresh data with device relationships
            if (selectedFloorId) {
                fetch(`/api/device-positions?floor_id=${selectedFloorId}`)
                    .then(r => r.json())
                    .then(setPositions)
                    .catch(() => setPositions([]));
            }
        } catch (err) {
            console.error('Save position error:', err);
            alert('Network error while saving position');
        }
    };

    const handleCreateFloor = async () => {
        if (!newFloor.name.trim()) return;
        setCreating(true);
        try {
            const branchId = currentBranch?.id ? String(currentBranch.id) : null;
            const res = await fetch('/api/floors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    branch_id: (branchId && branchId !== 'all') ? (typeof branchId === 'string' ? parseInt(branchId) : branchId) : null,
                    location_id: locationIdFromQuery || null,
                    name: newFloor.name.trim(),
                    level: newFloor.level ?? null,
                    plan_image_path: newFloor.plan_image_path || null,
                }),
            });
            if (res.ok) {
                const floor = await res.json();
                setFloors(prev => [...prev, floor].sort((a, b) => (a.level ?? 0) - (b.level ?? 0)));
                setSelectedFloorId(floor.id);
                setNewFloor({ name: '' });
                setShowFloorModal(false);
            } else {
                const error = await res.json().catch(() => ({ message: 'Failed to create floor' }));
                alert(error.message || 'Failed to create floor');
            }
        } catch (err) {
            console.error('Error creating floor:', err);
            alert('Network error while creating floor');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateFloor = async () => {
        if (!editingFloor || !newFloor.name.trim()) return;
        setCreating(true);
        try {
            const res = await fetch(`/api/floors/${editingFloor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    branch_id: editingFloor.branch_id,
                    location_id: editingFloor.location_id,
                    name: newFloor.name.trim(),
                    level: newFloor.level ?? null,
                    plan_image_path: newFloor.plan_image_path || null,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setFloors(prev => prev.map(f => f.id === updated.id ? updated : f).sort((a, b) => (a.level ?? 0) - (b.level ?? 0)));
                setEditingFloor(null);
                setNewFloor({ name: '' });
                setShowFloorModal(false);
                // Refresh the selected floor if it was the one being edited
                if (selectedFloorId === updated.id) {
                    setSelectedFloorId(null);
                    setTimeout(() => setSelectedFloorId(updated.id), 0); // Force refresh
                }
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Failed to update floor' }));
                const errorMessage = errorData.message || errorData.error || 'Failed to update floor';
                alert(errorMessage);
            }
        } catch (err) {
            console.error('Error updating floor:', err);
            alert('Network error while updating floor');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteFloor = async (floorId: number) => {
        try {
            const res = await fetch(`/api/floors/${floorId}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (res.ok || res.status === 204) {
                setFloors(prev => prev.filter(f => f.id !== floorId));
                if (selectedFloorId === floorId) {
                    setSelectedFloorId(null);
                }
                setShowDeleteConfirm(null);
            } else {
                const error = await res.text().catch(() => 'Failed to delete floor');
                alert(`Failed to delete floor: ${error}`);
            }
        } catch (err) {
            console.error('Error deleting floor:', err);
            alert('Network error while deleting floor');
        }
    };

    const openEditModal = (floor: Floor) => {
        setEditingFloor({ ...floor });
        setNewFloor({ 
            name: floor.name, 
            level: floor.level ?? null, 
            plan_image_path: floor.plan_image_path ?? '' 
        });
        setShowFloorModal(true);
    };

    const openCreateModal = () => {
        setEditingFloor(null);
        setNewFloor({ 
            name: '', 
            level: null, 
            plan_image_path: '' 
        });
        setShowFloorModal(true);
    };

    const closeModal = () => {
        setShowFloorModal(false);
        setEditingFloor(null);
        setNewFloor({ name: '' });
    };

    const imageClickPlace = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canEdit) return;
        if (!selectedFloorId || !selectedDeviceId || typeof selectedDeviceId !== 'number') return;
        
        // Don't trigger if clicking on a button or marker
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('[data-device-marker]')) {
            return;
        }
        
        if (!containerRef.current) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const rect = containerRef.current.getBoundingClientRect();
        // Account for zoom and pan
        const scale = zoomLevel;
        const offsetX = (rect.width * (1 - scale)) / 2 - panX;
        const offsetY = (rect.height * (1 - scale)) / 2 - panY;
        let x = (e.clientX - rect.left - offsetX) / (rect.width * scale);
        let y = (e.clientY - rect.top - offsetY) / (rect.height * scale);
        
        // Clamp to bounds
        x = Math.min(1, Math.max(0, x));
        y = Math.min(1, Math.max(0, y));
        
        await savePosition({
            floor_id: selectedFloorId,
            device_id: selectedDeviceId,
            x,
            y,
        });
    };

    const markerStyle = (p: DevicePosition) => ({
        left: `${p.x * 100}%`,
        top: `${p.y * 100}%`,
        transform: 'translate(-50%, -100%)',
    } as React.CSSProperties);

    const deviceName = (id: number) => devices.find(d => d.id === id)?.name || `#${id}`;

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanX(0);
        setPanY(0);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Don't start panning if clicking on a device marker or button
        const target = e.target as HTMLElement;
        if (target.closest('[data-device-marker]') || target.tagName === 'BUTTON' || target.closest('button')) {
            return;
        }
        
        // Don't start panning if dragging a device
        if (draggingDeviceId) return;
        
        // Start panning with middle mouse button, right mouse button, or spacebar + left click
        if (e.button === 1 || e.button === 2 || (e.button === 0 && isSpacePressed)) {
            e.preventDefault();
            e.stopPropagation();
            setIsPanning(true);
            panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && panStartRef.current) {
            e.preventDefault();
            setPanX(e.clientX - panStartRef.current.x);
            setPanY(e.clientY - panStartRef.current.y);
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        panStartRef.current = null;
    };

    // Touch event handlers for mobile panning
    const handleTouchStart = (e: React.TouchEvent) => {
        // Don't start panning if touching a device marker or button
        const target = e.target as HTMLElement;
        if (target.closest('[data-device-marker]') || target.tagName === 'BUTTON' || target.closest('button')) {
            return;
        }
        
        // Don't start panning if dragging a device
        if (draggingDeviceId) return;
        
        // Only pan with single touch (two fingers would be pinch zoom)
        if (e.touches.length === 1) {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            setIsPanning(true);
            panStartRef.current = { x: touch.clientX - panX, y: touch.clientY - panY };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isPanning && panStartRef.current && e.touches.length === 1) {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            setPanX(touch.clientX - panStartRef.current.x);
            setPanY(touch.clientY - panStartRef.current.y);
        }
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
        panStartRef.current = null;
    };

    // Track spacebar for panning
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                e.preventDefault();
                setIsSpacePressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                setIsSpacePressed(false);
                setIsPanning(false);
                panStartRef.current = null;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <MonitorLayout title="Floor Plan">
            <div className="space-y-4 sm:space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                // Go back to maps page if location_id is in query, otherwise go to dashboard
                                if (locationIdFromQuery) {
                                    router.visit(`/monitor/maps?location_id=${locationIdFromQuery}`);
                                } else {
                                    router.visit('/monitor/maps');
                                }
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            title="Go back to maps"
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Floor Plan Management</h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {canEdit ? 'Manage floor plans and device positions' : 'View floor plans and device locations'}
                            </p>
                        </div>
                    </div>
                    {canEdit && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                        >
                            <Plus className="size-4" />
                            <span>New Floor</span>
                        </button>
                    )}
                </div>

                {/* Floor Management Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Floor List Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Layers className="size-5 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Floors</h2>
                                    <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                        {floors.length}
                                    </span>
                                </div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto p-2">
                                {floors.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Layers className="mx-auto mb-3 size-10 text-slate-400" />
                                        <p className="text-sm text-slate-600 dark:text-slate-400">No floors found</p>
                                        {canEdit && (
                                            <button
                                                onClick={openCreateModal}
                                                className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Create your first floor
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {floors.map(floor => (
                                            <div
                                                key={floor.id}
                                                className={`group relative rounded-lg border-2 p-3 transition-all cursor-pointer ${
                                                    selectedFloorId === floor.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800'
                                                }`}
                                                onClick={() => setSelectedFloorId(floor.id)}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {floor.level !== null && (
                                                                <span className="flex-shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                                    L{floor.level}
                                                                </span>
                                                            )}
                                                            <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                                                                {floor.name}
                                                            </h3>
                                                        </div>
                                                        {floor.plan_image_path && (
                                                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                                <ImageIcon className="size-3" />
                                                                <span className="truncate">Plan image set</span>
                                                            </div>
                                                        )}
                                                        {positions.filter(p => p.floor_id === floor.id).length > 0 && (
                                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                {positions.filter(p => p.floor_id === floor.id).length} device{positions.filter(p => p.floor_id === floor.id).length !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {canEdit && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(floor);
                                                                }}
                                                                className="rounded p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                                title="Edit floor"
                                                            >
                                                                <Edit className="size-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowDeleteConfirm(floor.id);
                                                                }}
                                                                className="rounded p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                                                                title="Delete floor"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Floor Plan View */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Device Placement Controls (only in edit mode) */}
                        {canEdit && selectedFloorId && (
                            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-700 dark:from-slate-900/50 dark:to-slate-800/50">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Server className="size-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Place Device on Floor</span>
                                    </div>
                                    <select
                                        className="flex-1 w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        value={selectedDeviceId || ''}
                                        onChange={(e) => setSelectedDeviceId(e.target.value ? Number(e.target.value) : '')}
                                    >
                                        <option value="">— Select Device —</option>
                                        {devices.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.ip_address})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedDeviceId && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Click on the plan to place this device
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                <div className="relative">
                <div
                    ref={containerRef}
                    onClick={imageClickPlace}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseMove={(e) => {
                        // Handle panning first
                        if (isPanning && panStartRef.current) {
                            e.preventDefault();
                            e.stopPropagation();
                            setPanX(e.clientX - panStartRef.current.x);
                            setPanY(e.clientY - panStartRef.current.y);
                            return;
                        }
                        
                        // Handle device dragging
                        if (!canEdit) return;
                        if (!draggingDeviceId || !selectedFloorId || !containerRef.current) return;
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Cancel any pending animation frame
                        if (animationFrameRef.current !== null) {
                            cancelAnimationFrame(animationFrameRef.current);
                        }
                        
                        // Use requestAnimationFrame for smooth updates
                        animationFrameRef.current = requestAnimationFrame(() => {
                            if (!containerRef.current) return;
                            const rect = containerRef.current.getBoundingClientRect();
                            // Account for zoom and pan
                            const scale = zoomLevel;
                            const offsetX = (rect.width * (1 - scale)) / 2 - panX;
                            const offsetY = (rect.height * (1 - scale)) / 2 - panY;
                            let x = (e.clientX - rect.left - offsetX) / (rect.width * scale);
                            let y = (e.clientY - rect.top - offsetY) / (rect.height * scale);
                            
                            // Apply drag offset if available
                            if (dragOffsetRef.current) {
                                x -= dragOffsetRef.current.x;
                                y -= dragOffsetRef.current.y;
                            }
                            
                            // Clamp to bounds
                            x = Math.min(1, Math.max(0, x));
                            y = Math.min(1, Math.max(0, y));
                            
                            setPositions(prev => prev.map(p => p.device_id === draggingDeviceId ? { ...p, x, y } : p));
                            animationFrameRef.current = null;
                        });
                    }}
                    onMouseUp={async (e) => {
                        handleMouseUp();
                        if (!canEdit) return;
                        if (!draggingDeviceId || !selectedFloorId || !containerRef.current) return;
                        
                        // Don't trigger move if clicking on a button
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'BUTTON' || target.closest('button')) {
                            // Cancel drag if clicking on button
                            setDraggingDeviceId(null);
                            dragOffsetRef.current = null;
                            if (animationFrameRef.current !== null) {
                                cancelAnimationFrame(animationFrameRef.current);
                                animationFrameRef.current = null;
                            }
                            return;
                        }
                        
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Cancel any pending animation frame
                        if (animationFrameRef.current !== null) {
                            cancelAnimationFrame(animationFrameRef.current);
                            animationFrameRef.current = null;
                        }
                        
                        const rect = containerRef.current.getBoundingClientRect();
                        // Account for zoom and pan
                        const scale = zoomLevel;
                        const offsetX = (rect.width * (1 - scale)) / 2 - panX;
                        const offsetY = (rect.height * (1 - scale)) / 2 - panY;
                        let x = (e.clientX - rect.left - offsetX) / (rect.width * scale);
                        let y = (e.clientY - rect.top - offsetY) / (rect.height * scale);
                        
                        // Apply drag offset if available
                        if (dragOffsetRef.current) {
                            x -= dragOffsetRef.current.x;
                            y -= dragOffsetRef.current.y;
                        }
                        
                        // Clamp to bounds
                        x = Math.min(1, Math.max(0, x));
                        y = Math.min(1, Math.max(0, y));
                        
                        // Confirm move
                        const prev = positions.find(p => p.device_id === draggingDeviceId);
                        const confirmed = window.confirm(`Move ${prev ? deviceName(prev.device_id) : 'device'} to (${(x*100).toFixed(1)}%, ${(y*100).toFixed(1)}%)?`);
                        if (!confirmed) {
                            // Revert preview by resetting positions to previous value
                            if (prev) {
                                setPositions(ps => ps.map(p => p.device_id === prev.device_id ? { ...p, x: prev.x, y: prev.y } : p));
                            }
                            setDraggingDeviceId(null);
                            dragOffsetRef.current = null;
                            return;
                        }
                        const payload = {
                            floor_id: selectedFloorId,
                            device_id: draggingDeviceId,
                            x,
                            y,
                            marker_type: undefined,
                        };
                        setDraggingDeviceId(null);
                        dragOffsetRef.current = null;
                        await savePosition(payload);
                    }}
                    onMouseLeave={(e) => {
                        handleMouseUp();
                        if (draggingDeviceId && canEdit) {
                            // Cancel any pending animation frame
                            if (animationFrameRef.current !== null) {
                                cancelAnimationFrame(animationFrameRef.current);
                                animationFrameRef.current = null;
                            }
                            
                            // If mouse leaves container while dragging, cancel the drag
                            const prev = positions.find(p => p.device_id === draggingDeviceId);
                            if (prev) {
                                setPositions(ps => ps.map(p => p.device_id === prev.device_id ? { ...p, x: prev.x, y: prev.y } : p));
                            }
                            setDraggingDeviceId(null);
                            dragOffsetRef.current = null;
                        }
                    }}
                    className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 touch-pan-y touch-pan-x"
                    style={{ 
                        aspectRatio: '16 / 10', 
                        minHeight: '300px',
                        userSelect: 'none', 
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        touchAction: 'pan-x pan-y',
                        cursor: isPanning ? 'grabbing' : (isSpacePressed ? 'grab' : (draggingDeviceId ? 'grabbing' : 'default')),
                    }}
                >
                    {/* Zoom Controls - Inside the plan container */}
                    <div className="absolute right-2 sm:right-4 top-2 sm:top-4 z-20 flex flex-col gap-1 sm:gap-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200/50 p-1.5 sm:p-2 shadow-xl dark:bg-slate-800/95 dark:border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                            className="rounded-md border border-slate-300 p-1.5 sm:p-1.5 hover:bg-slate-100 active:scale-95 transition-all dark:border-slate-600 dark:hover:bg-slate-700 touch-manipulation"
                            title="Zoom In"
                        >
                            <ZoomIn className="size-4 sm:size-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                            className="rounded-md border border-slate-300 p-1.5 sm:p-1.5 hover:bg-slate-100 active:scale-95 transition-all dark:border-slate-600 dark:hover:bg-slate-700 touch-manipulation"
                            title="Zoom Out"
                        >
                            <ZoomOut className="size-4 sm:size-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                            className="rounded-md border border-slate-300 p-1.5 sm:p-1.5 hover:bg-slate-100 active:scale-95 transition-all dark:border-slate-600 dark:hover:bg-slate-700 touch-manipulation"
                            title="Reset Zoom"
                        >
                            <RotateCcw className="size-4 sm:size-4" />
                        </button>
                        <div className="px-1.5 py-1 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-0.5">
                            {Math.round(zoomLevel * 100)}%
                        </div>
                    </div>

                    <div
                        style={{
                            transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                            transformOrigin: 'top left',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                    {selectedFloor?.plan_image_path ? (
                        <img
                            ref={imageRef}
                            src={selectedFloor.plan_image_path}
                            className="h-full w-full object-contain select-none"
                            style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
                            alt={selectedFloor.name}
                            draggable={false}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <Upload className="mr-2 size-5" /> Select a floor with a plan image
                        </div>
                    )}

                    {/* Markers */}
                    {selectedFloor && positions.map((p) => (
                        <div
                            key={p.device_id}
                            data-device-marker
                            className={`absolute ${canEdit ? 'cursor-move group' : 'cursor-default'}`}
                            style={{ ...markerStyle(p), userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}
                            title={`${deviceName(p.device_id)} @ (${(p.x*100).toFixed(1)}%, ${(p.y*100).toFixed(1)}%)`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (canEdit && containerRef.current) {
                                    const containerRect = containerRef.current.getBoundingClientRect();
                                    const markerElement = e.currentTarget;
                                    const markerRect = markerElement.getBoundingClientRect();
                                    
                                    // The marker's anchor point is at (p.x, p.y) in normalized coordinates
                                    // But visually it's offset by translate(-50%, -100%)
                                    // Calculate where the user clicked relative to the container
                                    const clickX = e.clientX - containerRect.left;
                                    const clickY = e.clientY - containerRect.top;
                                    
                                    // The anchor point in container coordinates
                                    const anchorX = p.x * containerRect.width;
                                    const anchorY = p.y * containerRect.height;
                                    
                                    // Calculate offset from anchor to click position (normalized)
                                    dragOffsetRef.current = {
                                        x: (clickX - anchorX) / containerRect.width,
                                        y: (clickY - anchorY) / containerRect.height,
                                    };
                                    setDraggingDeviceId(p.device_id);
                                }
                            }}
                            draggable={false}
                        >
                            <div className="relative flex -translate-y-1/2 flex-col items-center select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                                <div className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium shadow dark:bg-slate-800/90 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                                    {deviceName(p.device_id)}
                                </div>
                                <div 
                                    className={`mt-1 rounded-full p-1.5 shadow ring-2 ring-white/60 dark:ring-slate-900/60 select-none relative animate-pulse ${
                                        p.device?.status === 'online' 
                                            ? 'bg-green-600 text-white' 
                                            : p.device?.status === 'warning'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-red-600 text-white'
                                    }`}
                                    style={{ 
                                        userSelect: 'none', 
                                        WebkitUserSelect: 'none',
                                        boxShadow: p.device?.status === 'online' 
                                            ? '0 0 15px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.5), 0 0 45px rgba(34, 197, 94, 0.3)' 
                                            : p.device?.status === 'warning'
                                            ? '0 0 15px rgba(234, 179, 8, 0.8), 0 0 30px rgba(234, 179, 8, 0.5), 0 0 45px rgba(234, 179, 8, 0.3)'
                                            : '0 0 15px rgba(220, 38, 38, 0.8), 0 0 30px rgba(220, 38, 38, 0.5), 0 0 45px rgba(220, 38, 38, 0.3)',
                                    }}
                                >
                                    {(() => {
                                        const Icon = getDeviceCategoryIcon(p.device?.category || '');
                                        return <Icon className="size-5" />;
                                    })()}
                                </div>
                                {canEdit && draggingDeviceId !== p.device_id && (
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!confirm(`Remove ${deviceName(p.device_id)} from this floor?`)) return;
                                        // Call delete
                                        const res = await fetch(`/api/device-positions/${p.id}`, {
                                            method: 'DELETE',
                                            headers: { Accept: 'application/json' },
                                            credentials: 'same-origin',
                                        });
                                        if (res.status === 204 || res.ok) {
                                            setPositions(prev => prev.filter(dp => dp.id !== p.id));
                                        } else {
                                            const text = await res.text().catch(() => '');
                                            alert(`Failed to delete position (${res.status}). ${text}`);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow hover:bg-red-700 group-hover:block z-10"
                                    title="Delete pin"
                                >
                                    Delete
                                </button>
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                </div>

                        {/* Floor Plan Info */}
                        {selectedFloor && (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {selectedFloor.name}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            {selectedFloor.level !== null && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="size-4" />
                                                    Level {selectedFloor.level}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Server className="size-4" />
                                                {positions.filter(p => p.floor_id === selectedFloor.id).length} device{positions.filter(p => p.floor_id === selectedFloor.id).length !== 1 ? 's' : ''}
                                            </span>
                                            {selectedFloor.plan_image_path && (
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                    <ImageIcon className="size-4" />
                                                    Plan image loaded
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(selectedFloor)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                            >
                                                <Edit className="size-4" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        {canEdit ? (
                            <>
                                <span className="hidden sm:inline">💡 Tip: Use zoom buttons to zoom. Pan with middle mouse button, right mouse button, or Space + drag. Select a device and click on the plan to place it.</span>
                                <span className="sm:hidden">💡 Tip: Use zoom buttons to zoom. Touch and drag to pan. Select a device and tap on the plan to place it.</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">View-only mode. Add <code className="rounded bg-slate-200 px-1 py-0.5 text-[10px] dark:bg-slate-700">?mode=config</code> to the URL to enable editing.</span>
                                <span className="sm:hidden">View-only mode. Add ?mode=config to enable editing.</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Create/Edit Floor Modal */}
            {showFloorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeModal}>
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                                        {editingFloor ? <Edit className="size-5 text-white" /> : <Plus className="size-5 text-white" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {editingFloor ? 'Edit Floor' : 'Create New Floor'}
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {editingFloor ? 'Update floor details and plan image' : 'Add a new floor plan to the system'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Floor Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Block A - Level 2, Main Building - Ground Floor"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    value={newFloor.name}
                                    onChange={(e) => setNewFloor(s => ({ ...s, name: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Level (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 0, 1, 2, -1"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        value={newFloor.level ?? ''}
                                        onChange={(e) => setNewFloor(s => ({ ...s, level: e.target.value ? Number(e.target.value) : null }))}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Location (Optional)
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        value={editingFloor?.location_id ?? locationIdFromQuery ?? ''}
                                        onChange={(e) => {
                                            if (editingFloor) {
                                                const newLocationId = e.target.value ? Number(e.target.value) : null;
                                                setEditingFloor(prev => prev ? { ...prev, location_id: newLocationId } : null);
                                            }
                                        }}
                                        disabled={!editingFloor && !!locationIdFromQuery}
                                    >
                                        <option value="">No location</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                    {!editingFloor && locationIdFromQuery && (
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Location is set from URL parameter
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Plan Image Path or URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="/storage/floor-plans/image.png or https://example.com/plan.jpg"
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        value={newFloor.plan_image_path ?? ''}
                                        onChange={(e) => setNewFloor(s => ({ ...s, plan_image_path: e.target.value }))}
                                    />
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                                        <Upload className="size-4" />
                                        <span className="hidden sm:inline">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const form = new FormData();
                                                form.append('image', file);
                                                const res = await fetch('/api/floor-plans/upload', {
                                                    method: 'POST',
                                                    body: form,
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setNewFloor(s => ({ ...s, plan_image_path: data.path }));
                                                } else {
                                                    alert('Upload failed');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Upload an image file or enter a URL/path to the floor plan image
                                </p>
                            </div>
                            {newFloor.plan_image_path && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <ImageIcon className="size-4" />
                                        <span className="truncate">{newFloor.plan_image_path}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-slate-200 p-6 dark:border-slate-700">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingFloor ? handleUpdateFloor : handleCreateFloor}
                                    disabled={creating || !newFloor.name.trim()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="size-4" />
                                    {creating ? 'Saving...' : (editingFloor ? 'Update Floor' : 'Create Floor')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white shadow-2xl dark:border-red-900/50 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-red-200 p-6 dark:border-red-900/50">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                    <Trash2 className="size-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Floor</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-700 dark:text-slate-300">
                                Are you sure you want to delete <strong>{floors.find(f => f.id === showDeleteConfirm)?.name}</strong>?
                            </p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                This will also delete all device positions on this floor.
                            </p>
                        </div>
                        <div className="border-t border-red-200 p-6 dark:border-red-900/50">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteFloor(showDeleteConfirm)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl"
                                >
                                    <Trash2 className="size-4" />
                                    Delete Floor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MonitorLayout>
    );
}


