import MonitorLayout from '@/layouts/monitor-layout';
import { MapPin, Server, Maximize2, Minimize2, Layers, Filter, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';

// Note: Install these packages:
// npm install leaflet.markercluster leaflet.heat
// npm install --save-dev @types/leaflet.markercluster @types/leaflet.heat

interface DeviceLocation {
    lat: number;
    lng: number;
    name: string;
    status: 'online' | 'warning' | 'offline';
    count: number;
    devices: string[];
    category: string;
    ip?: string;
    uptime?: string;
}

export default function Maps() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<DeviceLocation | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'dark'>('street');
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'warning' | 'offline'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const deviceLocations: DeviceLocation[] = [
        { 
            lat: 3.1390, 
            lng: 101.6869, 
            name: 'Server Room A', 
            status: 'online', 
            count: 5,
            category: 'Data Center',
            ip: '192.168.1.10',
            uptime: '99.9%',
            devices: ['Web Server 01', 'Database Server', 'Mail Server', 'Application Server', 'Backup Server']
        },
        { 
            lat: 3.1395, 
            lng: 101.6875, 
            name: 'Office Floor 2', 
            status: 'online', 
            count: 3,
            category: 'Office',
            ip: '192.168.2.10',
            uptime: '99.8%',
            devices: ['WiFi AP Floor 1', 'WiFi AP Floor 2', 'Access Switch']
        },
        { 
            lat: 3.1385, 
            lng: 101.6865, 
            name: 'Data Center Main', 
            status: 'warning', 
            count: 2,
            category: 'Data Center',
            ip: '192.168.1.1',
            uptime: '98.5%',
            devices: ['Core Switch 01', 'Core Switch 02']
        },
        { 
            lat: 3.1400, 
            lng: 101.6880, 
            name: 'TAS Building', 
            status: 'online', 
            count: 2,
            category: 'Branch',
            ip: '192.168.3.1',
            uptime: '99.7%',
            devices: ['TAS Main Gateway', 'TAS Backup Gateway']
        },
        { 
            lat: 3.1392, 
            lng: 101.6872, 
            name: 'CCTV Hub', 
            status: 'online', 
            count: 2,
            category: 'Security',
            ip: '192.168.4.1',
            uptime: '99.9%',
            devices: ['CCTV NVR Main', 'CCTV NVR Backup']
        },
        { 
            lat: 3.1380, 
            lng: 101.6870, 
            name: 'Parking WiFi', 
            status: 'offline', 
            count: 1,
            category: 'Access Point',
            ip: '192.168.5.1',
            uptime: '95.2%',
            devices: ['WiFi AP Outdoor']
        },
        { 
            lat: 3.1388, 
            lng: 101.6867, 
            name: 'Building B Network', 
            status: 'online', 
            count: 4,
            category: 'Office',
            ip: '192.168.6.1',
            uptime: '99.6%',
            devices: ['Switch B1', 'Switch B2', 'WiFi AP B1', 'WiFi AP B2']
        },
    ];

    const filteredLocations = deviceLocations.filter(location => {
        const matchesStatus = filterStatus === 'all' || location.status === filterStatus;
        const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            location.devices.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const createPulsingIcon = (color: string, count: number) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="position: relative;">
                    <!-- Outer pulse ring -->
                    <div style="
                        position: absolute;
                        width: 40px;
                        height: 40px;
                        left: -8px;
                        top: -8px;
                        background: ${color};
                        border-radius: 50%;
                        opacity: 0;
                        animation: pulse 2s ease-out infinite;
                    "></div>
                    
                    <!-- Main marker -->
                    <div style="
                        width: 24px;
                        height: 24px;
                        background: ${color};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        position: relative;
                        z-index: 1;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    "></div>
                    
                    <!-- Count badge -->
                    <div style="
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: white;
                        border: 2px solid ${color};
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        font-weight: bold;
                        color: #1e293b;
                        z-index: 2;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    ">${count}</div>
                    
                    <style>
                        @keyframes pulse {
                            0% {
                                transform: scale(0.5);
                                opacity: 0.8;
                            }
                            100% {
                                transform: scale(1.5);
                                opacity: 0;
                            }
                        }
                    </style>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12],
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'offline': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getTileLayer = (style: string) => {
        switch (style) {
            case 'satellite':
                return {
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                };
            case 'dark':
                return {
                    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                };
            default:
                return {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                };
        }
    };

    // Initialize map once
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current, {
            center: [3.1390, 101.6869],
            zoom: 15,
            zoomControl: false,
            attributionControl: true,
        });

        // Add zoom control to top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Add initial tile layer
        const tileLayer = getTileLayer(mapStyle);
        const layer = L.tileLayer(tileLayer.url, {
            attribution: tileLayer.attribution,
            maxZoom: 19,
        }).addTo(map);

        tileLayerRef.current = layer;

        // Add scale control
        L.control.scale({ position: 'bottomleft' }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update tile layer when map style changes
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove old tile layer
        if (tileLayerRef.current) {
            tileLayerRef.current.remove();
        }

        // Add new tile layer
        const tileLayer = getTileLayer(mapStyle);
        const layer = L.tileLayer(tileLayer.url, {
            attribution: tileLayer.attribution,
            maxZoom: 19,
        }).addTo(mapRef.current);

        tileLayerRef.current = layer;
    }, [mapStyle]);

    // Update markers when filters change
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add markers for filtered locations
        filteredLocations.forEach((location) => {
            const color = getStatusColor(location.status);
            const icon = createPulsingIcon(color, location.count);

            const marker = L.marker([location.lat, location.lng], { icon })
                .addTo(mapRef.current!)
                .bindPopup(`
                    <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%; box-shadow: 0 0 8px ${color};"></div>
                            <h3 style="margin: 0; font-weight: bold; color: #1e293b; font-size: 16px;">${location.name}</h3>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 12px 0; font-size: 12px;">
                            <span style="color: #64748b; font-weight: 500;">Category:</span>
                            <span style="color: #1e293b; font-weight: 600;">${location.category}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Status:</span>
                            <span style="color: ${color}; font-weight: 600; text-transform: capitalize;">${location.status}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Devices:</span>
                            <span style="color: #1e293b; font-weight: 600;">${location.count} device${location.count !== 1 ? 's' : ''}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">IP Address:</span>
                            <span style="color: #1e293b; font-weight: 600;">${location.ip}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Uptime:</span>
                            <span style="color: #10b981; font-weight: 600;">${location.uptime}</span>
                        </div>
                        
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px 0; color: #64748b; font-weight: 500; font-size: 11px; text-transform: uppercase;">Connected Devices</p>
                            ${location.devices.map(device => `
                                <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; margin: 4px 0; padding: 4px 8px; background: #f8fafc; border-radius: 4px;">
                                    <div style="width: 4px; height: 4px; background: ${color}; border-radius: 50%;"></div>
                                    ${device}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `, {
                    maxWidth: 300,
                    className: 'custom-popup'
                });

            marker.on('click', () => {
                setSelectedLocation(location);
            });

            // Add hover effect
            marker.on('mouseover', () => {
                marker.openPopup();
            });

            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (filteredLocations.length > 0) {
            const bounds = L.latLngBounds(filteredLocations.map(loc => [loc.lat, loc.lng]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [filterStatus, searchQuery]);

    // Check for incoming location parameter from dashboard
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const locationParam = urlParams.get('location');
        const focusLocation = urlParams.get('focusLocation');

        if (locationParam && focusLocation === 'true') {
            // Find the location in deviceLocations
            const foundLocation = deviceLocations.find(
                loc => loc.name.toLowerCase().includes(locationParam.toLowerCase())
            );

            if (foundLocation && mapRef.current) {
                // Set as selected
                setSelectedLocation(foundLocation);
                
                // Fly to location with animation
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.flyTo([foundLocation.lat, foundLocation.lng], 17, {
                            duration: 2,
                            easeLinearity: 0.25
                        });
                        
                        // Find and open the marker popup
                        const marker = markersRef.current.find(m => {
                            const latLng = m.getLatLng();
                            return latLng.lat === foundLocation.lat && latLng.lng === foundLocation.lng;
                        });
                        
                        if (marker) {
                            marker.openPopup();
                        }
                    }
                }, 500);
            }
        }
    }, []); // Run once on mount

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        
        // Trigger map resize after fullscreen state changes
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        }, 100);
    };

    return (
        <MonitorLayout title={t('maps.title')}>
            <div className="space-y-6">
                {/* Header - Hide in fullscreen */}
                {!isFullscreen && (
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                                {t('maps.title')}
                            </h1>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                {t('maps.subtitle')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Controls Bar - Hide in fullscreen */}
                {!isFullscreen && (
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200/50 bg-white p-4 shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('maps.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Filter Status */}
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('maps.filter')}:</span>
                            {['all', 'online', 'warning', 'offline'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status as any)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                        filterStatus === status
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Map Style */}
                        <div className="flex items-center gap-2">
                            <Layers className="size-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('maps.style')}:</span>
                            {[
                                { value: 'street', label: t('maps.street') },
                                { value: 'satellite', label: t('maps.satellite') },
                                { value: 'dark', label: t('maps.dark') }
                            ].map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => setMapStyle(style.value as any)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                        mapStyle === style.value
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/95 p-4' : 'grid gap-6 lg:grid-cols-3'}`}>
                    {/* Map Section */}
                    <div className={`${isFullscreen ? 'h-full' : 'lg:col-span-2'}`}>
                        <div className={`rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 shadow-2xl backdrop-blur-sm dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900/50 ${isFullscreen ? 'h-full' : ''}`} style={{ height: isFullscreen ? '100%' : '600px' }}>
                            <div className="flex items-center justify-between border-b border-slate-200/50 p-4 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                        <MapPin className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Network Topology
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} • {filteredLocations.reduce((sum, loc) => sum + loc.count, 0)} devices
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-900/30">
                                            <div className="size-2 animate-pulse rounded-full bg-emerald-500"></div>
                                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                {deviceLocations.filter(d => d.status === 'online').length} Online
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 dark:bg-amber-900/30">
                                            <div className="size-2 animate-pulse rounded-full bg-amber-500"></div>
                                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                                {deviceLocations.filter(d => d.status === 'warning').length} Warning
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 dark:bg-red-900/30">
                                            <div className="size-2 animate-pulse rounded-full bg-red-500"></div>
                                            <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                                {deviceLocations.filter(d => d.status === 'offline').length} Offline
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleFullscreen}
                                        className="rounded-lg bg-slate-100 p-2 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
                                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div 
                                ref={mapContainerRef}
                                className="relative overflow-hidden rounded-b-2xl" 
                                style={{ height: isFullscreen ? 'calc(100% - 73px)' : '524px' }}
                            />
                        </div>
                    </div>

                    {/* Device List Section - Hide in fullscreen */}
                    {!isFullscreen && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                                <div className="border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-700/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                            <MapPin className="size-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">
                                                Locations
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                Click to navigate
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="max-h-[520px] divide-y divide-slate-200/50 overflow-y-auto dark:divide-slate-700/50">
                                    {filteredLocations.map((location, idx) => {
                                        const isSelected = selectedLocation?.name === location.name;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedLocation(location);
                                                    if (mapRef.current) {
                                                        mapRef.current.flyTo([location.lat, location.lng], 17, {
                                                            duration: 1.5,
                                                            easeLinearity: 0.25
                                                        });
                                                    }
                                                }}
                                                className={`cursor-pointer p-4 transition-all ${
                                                    isSelected 
                                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20' 
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 size-3 animate-pulse rounded-full ${
                                                        location.status === 'online' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                                                        location.status === 'warning' ? 'bg-amber-500 shadow-lg shadow-amber-500/50' : 
                                                        'bg-red-500 shadow-lg shadow-red-500/50'
                                                    }`} />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">
                                                            {location.name}
                                                        </h4>
                                                        <div className="mt-2 space-y-1 text-xs">
                                                            <p className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                                                <span>Category:</span>
                                                                <span className="font-semibold">{location.category}</span>
                                                            </p>
                                                            <p className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                                                <span>Devices:</span>
                                                                <span className="font-semibold">{location.count}</span>
                                                            </p>
                                                            <p className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                                                <span>Uptime:</span>
                                                                <span className="font-semibold text-green-600 dark:text-green-400">{location.uptime}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {isSelected && (
                                                    <div className="mt-3 space-y-1 border-t border-slate-200/50 pt-3 dark:border-slate-700/50">
                                                        {location.devices.map((device, deviceIdx) => (
                                                            <div key={deviceIdx} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900">
                                                                <Server className="size-3 text-blue-600 dark:text-blue-400" />
                                                                <span className="font-medium text-slate-700 dark:text-slate-300">{device}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom CSS for popup styling */}
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                }
                .custom-popup .leaflet-popup-tip {
                    display: none;
                }
                .leaflet-container {
                    font-family: system-ui, -apple-system, sans-serif;
                }
            `}</style>
        </MonitorLayout>
    );
}
