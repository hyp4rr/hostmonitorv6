import MonitorLayout from '@/layouts/monitor-layout';
import { MapPin, Server, Maximize2, Minimize2, Layers, Filter, Search, AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { usePage } from '@inertiajs/react';
import type { CurrentBranch } from '@/types/branch';
import { PageProps } from '@/types';

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
    const { currentBranch } = usePage<PageProps>().props;
    
    // Get navigation parameters from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const navDeviceId = urlParams.get('deviceId') ? parseInt(urlParams.get('deviceId')!) : null;
    const navLat = urlParams.get('lat') ? parseFloat(urlParams.get('lat')!) : null;
    const navLng = urlParams.get('lng') ? parseFloat(urlParams.get('lng')!) : null;
    
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const highlightMarkerRef = useRef<L.Marker | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<DeviceLocation | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'dark'>('street');
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'warning' | 'offline'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [markersReady, setMarkersReady] = useState(false);

    // Add state for real locations from database
    const [dbLocations, setDbLocations] = useState<Array<{
        id: number;
        name: string;
        description: string | null;
        latitude: number;
        longitude: number;
        branch_id: number;
    }>>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    // Fetch locations from database
    useEffect(() => {
        if (!currentBranch?.id) return;

        setIsLoadingLocations(true);
        fetch(`/api/locations?branch_id=${currentBranch.id}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            console.log('Loaded locations:', data);
            setDbLocations(data);
        })
        .catch(err => console.error('Error loading locations:', err))
        .finally(() => setIsLoadingLocations(false));
    }, [currentBranch?.id]);

    // Use real devices from current branch for map markers (exclude offline_ack devices)
    const realDevices = (currentBranch?.devices || []).filter(device => device.status !== 'offline_ack');
    
    // Group devices by location coordinates
    const deviceLocationMap = new Map<string, typeof realDevices>();
    realDevices.forEach(device => {
        if (device.latitude && device.longitude) {
            const key = `${device.latitude},${device.longitude}`;
            const existing = deviceLocationMap.get(key) || [];
            deviceLocationMap.set(key, [...existing, device]);
        }
    });

    // Transform database locations + devices to map locations
    const deviceLocations: DeviceLocation[] = [];

    // Add locations from database with their assigned devices
    dbLocations.forEach(location => {
        if (!location.latitude || !location.longitude) return;

        // Find devices assigned to this location using location_id
        const locationDevices = realDevices.filter(d => 
            d.location_id === location.id
        );

        // Determine overall status based on devices at this location
        let status: 'online' | 'warning' | 'offline' = 'online';
        if (locationDevices.some(d => d.status === 'offline')) {
            status = 'offline';
        } else if (locationDevices.some(d => d.status === 'warning')) {
            status = 'warning';
        }

        // Calculate average uptime
        const avgUptime = locationDevices.length > 0
            ? (locationDevices.reduce((sum, d) => sum + (d.uptime_percentage || 0), 0) / locationDevices.length).toFixed(1)
            : '0.0';

        deviceLocations.push({
            lat: location.latitude,
            lng: location.longitude,
            name: location.name,
            status: status,
            count: locationDevices.length,
            devices: locationDevices.map(d => d.name),
            category: location.description || 'Location',
            ip: locationDevices[0]?.ip_address,
            uptime: `${avgUptime}%`,
        });
    });

    // Add devices without location assignment (fallback to device coordinates)
    realDevices.forEach(device => {
        // Only show if device has no location_id but has coordinates
        if (!device.location_id && device.latitude && device.longitude) {
            deviceLocations.push({
                lat: device.latitude,
                lng: device.longitude,
                name: device.name,
                status: device.status === 'online' ? 'online' : 
                        device.status === 'warning' ? 'warning' : 'offline',
                count: 1,
                devices: [device.name],
                category: device.category.charAt(0).toUpperCase() + device.category.slice(1),
                ip: device.ip_address,
                uptime: `${device.uptime_percentage}%`,
            });
        }
    });

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

    // Update markers when locations or filters change
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Show loading state
        if (isLoadingLocations) {
            return;
        }

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
                            
                            ${location.ip ? `
                                <span style="color: #64748b; font-weight: 500;">Primary IP:</span>
                                <span style="color: #1e293b; font-weight: 600;">${location.ip}</span>
                            ` : ''}
                            
                            <span style="color: #64748b; font-weight: 500;">Avg Uptime:</span>
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

            marker.on('mouseover', () => {
                marker.openPopup();
            });

            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (filteredLocations.length > 0) {
            const bounds = L.latLngBounds(filteredLocations.map(loc => [loc.lat, loc.lng]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else if (currentBranch?.id) {
            // Center on default coordinates if no locations
            mapRef.current.setView([3.1390, 101.6869], 15);
        }

        // Signal that markers are ready
        setMarkersReady(markersRef.current.length > 0);
    }, [filterStatus, searchQuery, isLoadingLocations, dbLocations.length]);

    // Check for incoming location parameter from dashboard
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const locationParam = urlParams.get('location');
        const focusLocation = urlParams.get('focusLocation');

        if (locationParam && focusLocation === 'true') {
            const foundLocation = deviceLocations.find(
                loc => loc.name.toLowerCase().includes(locationParam.toLowerCase())
            );

            if (foundLocation && mapRef.current) {
                setSelectedLocation(foundLocation);
                
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.flyTo([foundLocation.lat, foundLocation.lng], 17, {
                            duration: 2,
                            easeLinearity: 0.25
                        });
                        
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
    }, []); // Empty dependency array since we only want this to run once on mount

    // Handle navigation from devices page with specific coordinates
    useEffect(() => {
        console.log('Navigation params:', { navDeviceId, navLat, navLng, markersReady });
        
        if (navLat && navLng && mapRef.current && markersReady) {
            // Remove previous highlight marker if exists
            if (highlightMarkerRef.current) {
                highlightMarkerRef.current.remove();
            }

            // Create a special highlight marker
            const highlightIcon = L.divIcon({
                className: 'highlight-marker',
                html: `
                    <div style="position: relative;">
                        <div style="
                            position: absolute;
                            width: 60px;
                            height: 60px;
                            left: -18px;
                            top: -18px;
                            background: #3b82f6;
                            border-radius: 50%;
                            opacity: 0;
                            animation: highlight-pulse 1.5s ease-out infinite;
                        "></div>
                        <div style="
                            width: 24px;
                            height: 24px;
                            background: #3b82f6;
                            border: 4px solid white;
                            border-radius: 50%;
                            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 4px 12px rgba(0,0,0,0.3);
                            position: relative;
                            z-index: 1000;
                        "></div>
                        <style>
                            @keyframes highlight-pulse {
                                0% {
                                    transform: scale(0.3);
                                    opacity: 1;
                                }
                                100% {
                                    transform: scale(2);
                                    opacity: 0;
                                }
                            }
                        </style>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            // Add highlight marker
            const highlightMarker = L.marker([navLat, navLng], { 
                icon: highlightIcon,
                zIndexOffset: 1000 
            }).addTo(mapRef.current);
            
            highlightMarkerRef.current = highlightMarker;

            // Fly to the location with smooth animation
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.flyTo([navLat, navLng], 18, {
                        duration: 1.5,
                        easeLinearity: 0.25
                    });

                    // Find and open popup for the marker at this location
                    const marker = markersRef.current.find(m => {
                        const latLng = m.getLatLng();
                        return Math.abs(latLng.lat - navLat) < 0.0001 && 
                               Math.abs(latLng.lng - navLng) < 0.0001;
                    });
                    
                    if (marker) {
                        setTimeout(() => {
                            marker.openPopup();
                        }, 1000);
                    }
                }
            }, 300);

            // Remove highlight marker after 5 seconds
            setTimeout(() => {
                if (highlightMarkerRef.current) {
                    highlightMarkerRef.current.remove();
                    highlightMarkerRef.current = null;
                }
            }, 5000);
        }
    }, [navLat, navLng, markersReady]);

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
                {/* Loading State */}
                {isLoadingLocations && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <div className="flex items-center gap-3">
                            <div className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Loading locations from database...
                            </p>
                        </div>
                    </div>
                )}

                {/* No Locations Warning */}
                {!isLoadingLocations && dbLocations.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    No Locations Found
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Add locations in the Configuration page with latitude/longitude coordinates to display them on the map.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Branch Info Banner */}
                {currentBranch?.id && (
                    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                <MapPin className="size-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {currentBranch.name} - Network Map
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {dbLocations.length} location{dbLocations.length !== 1 ? 's' : ''} • 
                                    {deviceLocations.length} marker{deviceLocations.length !== 1 ? 's' : ''} • 
                                    {realDevices.length} device{realDevices.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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
