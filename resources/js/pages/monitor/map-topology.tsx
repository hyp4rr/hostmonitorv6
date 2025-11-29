import MonitorLayout from '@/layouts/monitor-layout';
import {
    Network,
    Server,
    MapPin,
    Building2,
    Layers,
    Filter,
    Search,
    ChevronDown,
    ChevronUp,
    X,
    Info,
    Lock,
    Wifi,
    HardDrive,
    Router,
    Eye,
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDeviceCategoryIcon } from '@/utils/device-icons';

interface Device {
    id: number;
    name: string;
    ip_address: string;
    category: string;
    status: string;
    brand?: string;
    model?: string;
    location_id?: number;
    location?: {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
    };
    building?: string;
    uptime_percentage?: number;
    response_time?: number;
}

interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
    devices?: Device[];
}

interface HierarchicalGroup {
    name: string;
    type: 'building' | 'floor' | 'location';
    devices: Device[];
    children?: HierarchicalGroup[];
    ip?: string;
    model?: string;
}

export default function MapTopology() {
    const { props } = usePage<PageProps>();
    const { currentBranch } = props;

    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());
    const connectionsRef = useRef<L.Polyline[]>([]);
    
    const [devices, setDevices] = useState<Device[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<HierarchicalGroup | null>(null);
    const [showHierarchy, setShowHierarchy] = useState(false);
    const [hierarchyView, setHierarchyView] = useState<'map' | 'hierarchy'>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [groupBy, setGroupBy] = useState<'location' | 'building' | 'category'>('location');

    // Load devices and locations
    useEffect(() => {
        loadData();
    }, [currentBranch?.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load devices
            const devicesResponse = await fetch(
                `/api/devices?branch_id=${currentBranch?.id || 'all'}&per_page=1000&include_inactive=true&active_filter=all`
            );
            const devicesData = await devicesResponse.json();
            const devicesList = devicesData.data || devicesData || [];
            setDevices(devicesList);

            // Load locations
            const locationsResponse = await fetch(
                `/api/locations?branch_id=${currentBranch?.id || 'all'}`
            );
            const locationsList = await locationsResponse.json();
            setLocations(locationsList || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [2.9, 101.7], // Default center (adjust based on your location)
            zoom: 15,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Group devices hierarchically
    const hierarchicalGroups = useMemo(() => {
        const groups: Map<string, HierarchicalGroup> = new Map();

        devices.forEach(device => {
            let groupKey = '';
            let groupName = '';

            if (groupBy === 'location' && device.location) {
                groupKey = `location-${device.location.id}`;
                groupName = device.location.name;
            } else if (groupBy === 'building' && device.building) {
                groupKey = `building-${device.building}`;
                groupName = device.building;
            } else if (groupBy === 'category') {
                groupKey = `category-${device.category}`;
                groupName = device.category.charAt(0).toUpperCase() + device.category.slice(1);
            } else {
                groupKey = 'ungrouped';
                groupName = 'Ungrouped';
            }

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    name: groupName,
                    type: groupBy === 'location' ? 'location' : groupBy === 'building' ? 'building' : 'location',
                    devices: [],
                });
            }

            groups.get(groupKey)!.devices.push(device);
        });

        return Array.from(groups.values());
    }, [devices, groupBy]);

    // Filter devices
    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                device.ip_address.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || device.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [devices, searchQuery, statusFilter, categoryFilter]);

    // Update map markers
    useEffect(() => {
        if (!mapRef.current || isLoading) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current.clear();
        connectionsRef.current.forEach(line => line.remove());
        connectionsRef.current = [];

        // Group devices by location
        const devicesByLocation = new Map<number, Device[]>();
        filteredDevices.forEach(device => {
            if (device.location_id) {
                if (!devicesByLocation.has(device.location_id)) {
                    devicesByLocation.set(device.location_id, []);
                }
                devicesByLocation.get(device.location_id)!.push(device);
            }
        });

        // Create markers for each location with devices
        locations.forEach(location => {
            const locationDevices = devicesByLocation.get(location.id) || [];
            if (locationDevices.length === 0) return;

            const onlineCount = locationDevices.filter(d => d.status === 'online').length;
            const warningCount = locationDevices.filter(d => d.status === 'warning').length;
            const offlineCount = locationDevices.filter(d => d.status === 'offline' || d.status === 'offline_ack').length;

            // Create custom icon based on status
            const getStatusColor = () => {
                if (offlineCount > 0) return '#ef4444'; // Red
                if (warningCount > 0) return '#f59e0b'; // Yellow
                return '#10b981'; // Green
            };

            const icon = L.divIcon({
                className: 'custom-device-marker',
                html: `
                    <div style="
                        background: ${getStatusColor()};
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                    ">
                        ${locationDevices.length}
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const marker = L.marker([location.latitude, location.longitude], { icon })
                .addTo(mapRef.current!)
                .bindPopup(createLocationPopup(location, locationDevices))
                .on('click', () => {
                    setSelectedGroup({
                        name: location.name,
                        type: 'location',
                        devices: locationDevices,
                    });
                    setShowHierarchy(true);
                });

            markersRef.current.set(location.id, marker);
        });

        // Draw connections between related devices (same location or building)
        if (groupBy === 'location') {
            drawConnections();
        }
    }, [filteredDevices, locations, isLoading, groupBy]);

    const createLocationPopup = (location: Location, devices: Device[]) => {
        const onlineCount = devices.filter(d => d.status === 'online').length;
        const warningCount = devices.filter(d => d.status === 'warning').length;
        const offlineCount = devices.filter(d => d.status === 'offline' || d.status === 'offline_ack').length;

        return `
            <div style="min-width: 300px; max-width: 400px; font-family: system-ui;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
                    ${location.name}
                </div>
                <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px;">
                    <div style="color: #10b981; font-weight: 600;">🟢 ${onlineCount} Online</div>
                    <div style="color: #f59e0b; font-weight: 600;">🟡 ${warningCount} Warning</div>
                    <div style="color: #ef4444; font-weight: 600;">🔴 ${offlineCount} Offline</div>
                </div>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${devices.slice(0, 10).map(device => `
                        <div style="padding: 8px; margin-bottom: 4px; background: #f8fafc; border-radius: 4px; cursor: pointer;" 
                             onclick="window.selectDevice(${device.id})">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; color: #1e293b;">${device.name}</div>
                                    <div style="font-size: 11px; color: #64748b;">${device.ip_address}</div>
                                    ${device.model ? `<div style="font-size: 10px; color: #94a3b8;">${device.model}</div>` : ''}
                                </div>
                                <div style="
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50%;
                                    background: ${device.status === 'online' ? '#10b981' : device.status === 'warning' ? '#f59e0b' : '#ef4444'};
                                    box-shadow: 0 0 4px ${device.status === 'online' ? '#10b981' : device.status === 'warning' ? '#f59e0b' : '#ef4444'};
                                "></div>
                            </div>
                        </div>
                    `).join('')}
                    ${devices.length > 10 ? `<div style="text-align: center; color: #64748b; font-size: 11px; margin-top: 8px;">+${devices.length - 10} more devices</div>` : ''}
                </div>
            </div>
        `;
    };

    const drawConnections = () => {
        // Clear existing connections
        connectionsRef.current.forEach(line => line.remove());
        connectionsRef.current = [];

        // Group devices by location and draw connections
        const locationGroups = new Map<number, Device[]>();
        filteredDevices.forEach(device => {
            if (device.location_id) {
                if (!locationGroups.has(device.location_id)) {
                    locationGroups.set(device.location_id, []);
                }
                locationGroups.get(device.location_id)!.push(device);
            }
        });

        // Draw lines between locations with devices (only if they have connections)
        // For now, connect locations that are close to each other (within 0.01 degrees)
        const locationArray = Array.from(locationGroups.keys());
        for (let i = 0; i < locationArray.length; i++) {
            for (let j = i + 1; j < locationArray.length; j++) {
                const loc1 = locations.find(l => l.id === locationArray[i]);
                const loc2 = locations.find(l => l.id === locationArray[j]);
                
                if (loc1 && loc2) {
                    // Calculate distance
                    const distance = Math.sqrt(
                        Math.pow(loc1.latitude - loc2.latitude, 2) + 
                        Math.pow(loc1.longitude - loc2.longitude, 2)
                    );
                    
                    // Only draw connections for nearby locations (adjust threshold as needed)
                    if (distance < 0.01) {
                        const line = L.polyline(
                            [[loc1.latitude, loc1.longitude], [loc2.latitude, loc2.longitude]],
                            {
                                color: '#22c55e',
                                weight: 3,
                                opacity: 0.7,
                            }
                        ).addTo(mapRef.current!);
                        connectionsRef.current.push(line);
                    }
                }
            }
        }
    };

    // Expose selectDevice to window for popup clicks
    useEffect(() => {
        (window as any).selectDevice = (deviceId: number) => {
            const device = devices.find(d => d.id === deviceId);
            if (device) {
                setSelectedDevice(device);
            }
        };
    }, [devices]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />;
            case 'warning':
                return <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50" />;
            case 'offline':
            case 'offline_ack':
                return <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />;
            default:
                return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        const IconComponent = getDeviceCategoryIcon(category);
        return <IconComponent className="w-5 h-5" />;
    };

    return (
        <MonitorLayout title="Map Topology">
            <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-4">
                {/* Top Controls */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search devices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="online">Online</option>
                        <option value="warning">Warning</option>
                        <option value="offline">Offline</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="switches">Switches</option>
                        <option value="servers">Servers</option>
                        <option value="wifi">WiFi</option>
                        <option value="tas">TAS</option>
                        <option value="cctv">CCTV</option>
                    </select>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as any)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="location">Group by Location</option>
                        <option value="building">Group by Building</option>
                        <option value="category">Group by Category</option>
                    </select>
                    <button
                        onClick={() => setHierarchyView(hierarchyView === 'map' ? 'hierarchy' : 'map')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Layers className="w-4 h-4" />
                        {hierarchyView === 'map' ? 'Show Hierarchy' : 'Show Map'}
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex gap-4">
                    {/* Map View */}
                    {hierarchyView === 'map' && (
                        <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div ref={mapContainerRef} className="w-full h-full" />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-50">
                                    <div className="text-slate-600 dark:text-slate-400">Loading map...</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hierarchy View - Similar to the image with hierarchical levels */}
                    {hierarchyView === 'hierarchy' && (
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Network Hierarchy</h2>
                            <div className="space-y-6">
                                {hierarchicalGroups.map((group, index) => {
                                    // Group devices by building/floor if building field exists
                                    const devicesByBuilding = new Map<string, Device[]>();
                                    group.devices.forEach(device => {
                                        const building = device.building || 'Ungrouped';
                                        if (!devicesByBuilding.has(building)) {
                                            devicesByBuilding.set(building, []);
                                        }
                                        devicesByBuilding.get(building)!.push(device);
                                    });

                                    return (
                                        <div key={index} className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-5 bg-blue-50/30 dark:bg-blue-900/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{group.name}</h3>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded">
                                                        {group.devices.length} devices
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedGroup(selectedGroup?.name === group.name ? null : group)}
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                >
                                                    {selectedGroup?.name === group.name ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {selectedGroup?.name === group.name && (
                                                <div className="mt-4 space-y-4">
                                                    {Array.from(devicesByBuilding.entries()).map(([building, buildingDevices]) => (
                                                        <div key={building} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                                <Layers className="w-4 h-4" />
                                                                {building}
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {buildingDevices.map(device => (
                                                                    <div
                                                                        key={device.id}
                                                                        onClick={() => setSelectedDevice(device)}
                                                                        className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600 transition-all"
                                                                    >
                                                                        <div className="flex items-start gap-3 flex-1">
                                                                            <div className="mt-1">
                                                                                {getCategoryIcon(device.category)}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{device.name}</div>
                                                                                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-1">{device.ip_address}</div>
                                                                                {device.model && (
                                                                                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate">{device.model}</div>
                                                                                )}
                                                                                {device.brand && (
                                                                                    <div className="text-xs text-slate-500 dark:text-slate-500">{device.brand}</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="ml-2 flex-shrink-0">
                                                                            {getStatusIcon(device.status)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Device Details Sidebar */}
                    <div className="w-96 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Device Details</h2>
                        {selectedDevice ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedDevice.name}</h3>
                                    {getStatusIcon(selectedDevice.status)}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">IP Address</label>
                                        <p className="text-slate-900 dark:text-white font-mono">{selectedDevice.ip_address}</p>
                                    </div>
                                    {selectedDevice.model && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</label>
                                            <p className="text-slate-900 dark:text-white">{selectedDevice.model}</p>
                                        </div>
                                    )}
                                    {selectedDevice.brand && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Brand</label>
                                            <p className="text-slate-900 dark:text-white">{selectedDevice.brand}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
                                        <p className="text-slate-900 dark:text-white capitalize">{selectedDevice.category}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                        <p className="text-slate-900 dark:text-white capitalize">{selectedDevice.status}</p>
                                    </div>
                                    {selectedDevice.uptime_percentage !== undefined && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Uptime</label>
                                            <p className="text-slate-900 dark:text-white">{selectedDevice.uptime_percentage.toFixed(2)}%</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                                <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Select a device to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MonitorLayout>
    );
}

