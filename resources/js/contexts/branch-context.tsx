import { createContext, useContext, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';

interface Device {
    id: number;
    name: string;
    ip_address: string;
    mac_address: string;
    barcode: string;
    type: string;
    category: string;
    status: string;
    location: string;
    building: string;
    manufacturer: string;
    model: string;
    priority: number;
    uptime_percentage: number;
    response_time: number | null;
    last_check: string | null;
    offline_reason?: string;
    offline_acknowledged_by?: string;
    offline_acknowledged_at?: string;
    latitude?: number;
    longitude?: number;
}

interface Branch {
    id: number;
    name: string;
    code: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
    devices: Device[];
    deviceCount: number;
    locations: string[];
}

interface BranchContextType {
    currentBranch: Branch;
    branches: Branch[];
    switchBranch: (branchId: number) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

// Default branch for when data is not available
const defaultBranch: Branch = {
    id: 1,
    name: 'UTHM Main Campus',
    code: 'MAIN',
    description: 'Main campus network infrastructure',
    address: 'Parit Raja, Batu Pahat, Johor',
    latitude: 1.8542,
    longitude: 103.0839,
    is_active: true,
    devices: [],
    deviceCount: 0,
    locations: [],
};

export function BranchProvider({ children }: { children: ReactNode }) {
    // This will now work because BranchProvider is used inside Inertia pages
    const page = usePage();
    
    // Try to get branch from page props, fallback to default
    const currentBranch = (page.props.currentBranch as Branch) || defaultBranch;
    
    // For now, just use current branch as the only branch
    const branches = [currentBranch];

    const switchBranch = (branchId: number) => {
        // In production, this would navigate or update the current branch
        console.log('Switching to branch:', branchId);
    };

    return (
        <BranchContext.Provider value={{ currentBranch, branches, switchBranch }}>
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