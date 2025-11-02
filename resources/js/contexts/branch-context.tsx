import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Device {
    id: number;
    name: string;
    ip_address: string;
    type: string;
    category: string;
    status: 'up' | 'down' | 'warning' | 'unknown' | 'maintenance' | 'disabled' | 'online' | 'offline' | 'offline_ack';
    location: string;
    building: string;
    manufacturer: string;
    model: string;
    priority: number;
    uptime_percentage: number;
    response_time: number | null;
    is_monitored: boolean;
    is_active: boolean;
    last_check: string | null;
    created_at: string;
    updated_at: string;
    offline_reason?: string;
    offline_acknowledged_by?: string;
    offline_acknowledged_at?: string;
    mac_address: string;
    barcode: string;
    latitude?: number;
    longitude?: number;
}

export interface Branch {
    id: string;
    name: string;
    code: string;
    description: string;
    locations: string[];
    deviceCount: number;
    devices: Device[];
}

interface BranchContextType {
    currentBranch: Branch;
    setCurrentBranch: (branch: Branch) => void;
    branches: Branch[];
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

// Generate dummy devices for each location
const generateDevices = (branchId: string, locations: string[]): Device[] => {
    const devices: Device[] = [];
    let deviceId = parseInt(branchId) * 1000;
    
    const categories = ['switches', 'servers', 'wifi', 'tas', 'cctv'];
    const manufacturers = ['Cisco', 'HP', 'Dell', 'Ubiquiti', 'Aruba', 'Hikvision'];
    const statuses: Device['status'][] = ['online', 'offline', 'offline_ack', 'warning'];
    
    // Base coordinates for each location (slight variations)
    const baseCoords = { lat: 3.1390, lng: 101.6869 };
    
    locations.forEach((location, locIndex) => {
        // Add 3-8 devices per location
        const deviceCount = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < deviceCount; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
            const status = statuses[Math.floor(Math.random() * 100) < 85 ? 0 : Math.floor(Math.random() * statuses.length)];
            const uptime = status === 'online' ? 95 + Math.random() * 5 : 80 + Math.random() * 15;
            
            // Generate MAC address
            const macAddress = Array.from({ length: 6 }, () => 
                Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join(':').toUpperCase();
            
            // Generate barcode (0000XXXXXX format)
            const barcode = `0000${String(deviceId).padStart(6, '0')}`;
            
            // Generate coordinates near the location
            const lat = baseCoords.lat + (locIndex * 0.0005) + (i * 0.0001);
            const lng = baseCoords.lng + (locIndex * 0.0005) + (i * 0.0001);
            
            // Determine device name based on category
            let devicePrefix = '';
            switch (category) {
                case 'switches':
                    devicePrefix = 'Switch';
                    break;
                case 'servers':
                    devicePrefix = 'Server';
                    break;
                case 'wifi':
                    devicePrefix = 'WiFi AP';
                    break;
                case 'tas':
                    devicePrefix = 'TAS';
                    break;
                case 'cctv':
                    devicePrefix = 'CCTV';
                    break;
            }
            
            devices.push({
                id: deviceId++,
                name: `${devicePrefix} ${location.split(' ').pop()} ${i + 1}`,
                ip_address: `192.168.${locIndex + 1}.${10 + i}`,
                type: category === 'switches' ? 'switch' : category === 'servers' ? 'server' : category === 'wifi' ? 'access_point' : category,
                category,
                status,
                location,
                building: location.split(' ')[0],
                manufacturer,
                model: `${manufacturer}-${Math.floor(Math.random() * 9000) + 1000}`,
                priority: Math.floor(Math.random() * 5) + 1,
                uptime_percentage: parseFloat(uptime.toFixed(2)),
                response_time: status === 'online' ? Math.floor(Math.random() * 50) + 10 : null,
                is_monitored: true,
                is_active: status !== 'disabled',
                last_check: status === 'online' ? new Date(Date.now() - Math.random() * 300000).toISOString() : null,
                created_at: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
                updated_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                offline_reason: status === 'offline_ack' ? 'Scheduled maintenance for system upgrade' : undefined,
                offline_acknowledged_by: status === 'offline_ack' ? 'Admin User' : undefined,
                offline_acknowledged_at: status === 'offline_ack' ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
                mac_address: macAddress,
                barcode: barcode,
                latitude: lat,
                longitude: lng,
            });
        }
    });
    
    return devices;
};

const branches: Branch[] = [
    {
        id: '1',
        name: 'UTHM Kampus Parit Raja',
        code: 'KPR',
        description: 'Main Campus - Parit Raja',
        locations: [
            'MC Blok ABC',
            'MC Blok DEFG',
            'MC FKAAB',
            'MC FKEE QA.QB',
            'MC FPTP',
            'MC FPTV',
            'MC FSKTM',
            'MC HEPA.Cafe.OriccF6',
            'MC Kabin Uniform',
            'MC KK Perwira',
            'MC KK TSN.TDI.TF',
            'MC Perpustakaan.Masjid.DSI.PPP',
            'MC Rack Server A5',
            'MC Rack Server C2',
            'MC RF Bridging',
            'PUMAS',
            'NDC',
        ],
        deviceCount: 0,
        devices: [],
    },
    {
        id: '2',
        name: 'UTHM Kampus Bandar',
        code: 'KB',
        description: 'City Campus - Batu Pahat',
        locations: [
            'KB Main Building',
            'KB Server Room',
            'KB Library',
            'KB Administration',
            'KB Student Center',
            'KB Parking Area',
        ],
        deviceCount: 0,
        devices: [],
    },
    {
        id: '3',
        name: 'UTHM Kampus Tanjung Laboh',
        code: 'KTL',
        description: 'Maritime Campus - Tanjung Laboh',
        locations: [
            'KTL Main Building',
            'KTL Server Room',
            'KTL Workshop',
            'KTL Maritime Lab',
            'KTL Administration',
            'KTL Hostel',
        ],
        deviceCount: 0,
        devices: [],
    },
    {
        id: '4',
        name: 'UTHM Kampus Sungai Buloh',
        code: 'KSB',
        description: 'Medical Campus - Sungai Buloh',
        locations: [
            'KSB Main Building',
            'KSB Server Room',
            'KSB Medical Lab',
            'KSB Lecture Hall',
            'KSB Administration',
            'KSB Clinic',
        ],
        deviceCount: 0,
        devices: [],
    },
    {
        id: '5',
        name: 'UTHM Kampus Pagoh',
        code: 'KPG',
        description: 'Engineering Campus - Pagoh',
        locations: [
            'KPG Main Building',
            'KPG Server Room',
            'KPG Engineering Lab',
            'KPG Workshop',
            'KPG Library',
            'KPG Administration',
            'KPG Student Center',
            'KPG Lecture Hall',
        ],
        deviceCount: 0,
        devices: [],
    },
];

// Generate devices for each branch
branches.forEach(branch => {
    branch.devices = generateDevices(branch.id, branch.locations);
    branch.deviceCount = branch.devices.length;
});

export function BranchProvider({ children }: { children: ReactNode }) {
    const [currentBranch, setCurrentBranch] = useState<Branch>(branches[0]);

    return (
        <BranchContext.Provider value={{ currentBranch, setCurrentBranch, branches }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranch() {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
}
